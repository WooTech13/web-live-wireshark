const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class TsharkManager {
  constructor(io) {
    this.io = io;
    this.activeCaptures = new Map();
    this.captureData = new Map();
  }

  async getNetworkInterfaces() {
    return new Promise((resolve, reject) => {
      const tshark = spawn('tshark', ['-D']);
      let output = '';

      tshark.stdout.on('data', (data) => {
        output += data.toString();
      });

      tshark.on('close', (code) => {
        if (code === 0) {
          const interfaces = output.split('\n')
            .filter(line => line.trim())
            .map(line => {
              console.log(line)
              const match = true; //line.match(/^(\d+)\.\s(.+)\s\((.+)\)$/);
              if (match) {
                return {
                  id: match[1],
                  name: match[2],
                  description: match[3]
                };
              } else {
                console.log(false)
              }
              return null;
            })
            .filter(Boolean);
          resolve(interfaces);
        } else {
          reject(new Error('Failed to get interfaces'));
        }
      });
    });
  }

  startCapture(sessionId, interfaceName, filter, socket) {
    if (this.activeCaptures.has(sessionId)) {
      this.stopCapture(sessionId);
    }

    const captureFile = path.join(__dirname, '../captures', `${sessionId}-${Date.now()}.pcap`);
    
    // Assurer que le dossier existe
    if (!fs.existsSync(path.dirname(captureFile))) {
      fs.mkdirSync(path.dirname(captureFile), { recursive: true });
    }

    const args = [
      '-i', interfaceName,
      '-l', // Ligne par ligne
      '-T', 'json', // Output JSON
      '-w', captureFile // Écrire dans un fichier
    ];

    if (filter && filter.trim()) {
      args.push('-f', filter);
    }

    const tshark = spawn('tshark', args);
    const captureInfo = {
      process: tshark,
      paused: false,
      packets: [],
      captureFile: captureFile,
      startTime: Date.now()
    };

    this.activeCaptures.set(sessionId, captureInfo);
    this.captureData.set(sessionId, []);

    // Traitement des données JSON en temps réel
    let buffer = '';
    tshark.stdout.on('data', (data) => {
      if (captureInfo.paused) return;

      buffer += data.toString();
      const lines = buffer.split('\n');
      buffer = lines.pop(); // Garder la ligne incomplète

      lines.forEach(line => {
        if (line.trim()) {
          try {
            const packet = JSON.parse(line);
            const parsedPacket = this.parsePacket(packet);
            
            captureInfo.packets.push(parsedPacket);
            this.captureData.get(sessionId).push(parsedPacket);
            
            socket.emit('packet-captured', parsedPacket);
            socket.emit('capture-stats', {
              totalPackets: captureInfo.packets.length,
              duration: Date.now() - captureInfo.startTime
            });
          } catch (error) {
            console.error('Error parsing packet JSON:', error);
          }
        }
      });
    });

    tshark.stderr.on('data', (data) => {
      console.error('tshark stderr:', data.toString());
      socket.emit('capture-error', data.toString());
    });

    tshark.on('close', (code) => {
      console.log(`tshark process closed with code ${code}`);
      socket.emit('capture-stopped', { code, totalPackets: captureInfo.packets.length });
    });

    socket.emit('capture-started', { 
      interface: interfaceName, 
      filter: filter || 'none',
      captureFile: captureFile
    });
  }

  parsePacket(rawPacket) {
    const layers = rawPacket._source?.layers || {};
    
    return {
      id: uuidv4(),
      timestamp: Date.now(),
      number: rawPacket._index || 0,
      source: layers.ip?.['ip.src'] || layers.ipv6?.['ipv6.src'] || 'Unknown',
      destination: layers.ip?.['ip.dst'] || layers.ipv6?.['ipv6.dst'] || 'Unknown',
      protocol: layers.frame?.['frame.protocols']?.split(':').pop()?.toUpperCase() || 'Unknown',
      length: layers.frame?.['frame.len'] || 0,
      info: this.getPacketInfo(layers),
      layers: this.parseLayers(layers),
      raw: rawPacket
    };
  }

  getPacketInfo(layers) {
    if (layers.tcp) {
      const srcPort = layers.tcp['tcp.srcport'];
      const dstPort = layers.tcp['tcp.dstport'];
      const flags = layers.tcp['tcp.flags'] || '0';
      return `${srcPort} → ${dstPort} [TCP] Flags: ${flags}`;
    }
    
    if (layers.udp) {
      const srcPort = layers.udp['udp.srcport'];
      const dstPort = layers.udp['udp.dstport'];
      return `${srcPort} → ${dstPort} [UDP]`;
    }
    
    if (layers.icmp) {
      return `ICMP ${layers.icmp['icmp.type']} (${layers.icmp['icmp.code']})`;
    }
    
    return 'Unknown protocol';
  }

  parseLayers(layers) {
    const parsedLayers = {};
    
    Object.keys(layers).forEach(layerName => {
      parsedLayers[layerName] = {
        name: layerName.toUpperCase(),
        fields: layers[layerName]
      };
    });
    
    return parsedLayers;
  }

  stopCapture(sessionId) {
    const captureInfo = this.activeCaptures.get(sessionId);
    if (captureInfo) {
      captureInfo.process.kill('SIGTERM');
      this.activeCaptures.delete(sessionId);
    }
  }

  pauseCapture(sessionId) {
    const captureInfo = this.activeCaptures.get(sessionId);
    if (captureInfo) {
      captureInfo.paused = true;
    }
  }

  resumeCapture(sessionId) {
    const captureInfo = this.activeCaptures.get(sessionId);
    if (captureInfo) {
      captureInfo.paused = false;
    }
  }

  exportCapture(sessionId, format, socket) {
    const captureInfo = this.activeCaptures.get(sessionId);
    if (!captureInfo) {
      socket.emit('export-error', 'No active capture found');
      return;
    }

    const exportFile = captureInfo.captureFile.replace('.pcap', `.${format}`);
    
    if (format === 'json') {
      const jsonData = JSON.stringify(this.captureData.get(sessionId), null, 2);
      fs.writeFileSync(exportFile, jsonData);
      socket.emit('export-complete', { file: exportFile, format });
    } else if (format === 'csv') {
      // Conversion CSV basique
      const csvData = this.convertToCSV(this.captureData.get(sessionId));
      fs.writeFileSync(exportFile, csvData);
      socket.emit('export-complete', { file: exportFile, format });
    } else {
      socket.emit('export-complete', { file: captureInfo.captureFile, format: 'pcap' });
    }
  }

  convertToCSV(packets) {
    const headers = ['Number', 'Timestamp', 'Source', 'Destination', 'Protocol', 'Length', 'Info'];
    const csvRows = [headers.join(',')];
    
    packets.forEach(packet => {
      const row = [
        packet.number,
        new Date(packet.timestamp).toISOString(),
        packet.source,
        packet.destination,
        packet.protocol,
        packet.length,
        `"${packet.info}"`
      ];
      csvRows.push(row.join(','));
    });
    
    return csvRows.join('\n');
  }
}

module.exports = TsharkManager;