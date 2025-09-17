<template>
  <div class="packet-list">
    <div class="packet-list-header">
      <h3>📦 Packets ({{ packets.length }})</h3>
      <button @click="clearPackets" class="btn-clear" title="Clear packet list">
        🗑️ Clear
      </button>
    </div>
    
    <div class="packet-table-container">
      <table class="packet-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Time</th>
            <th>Source</th>
            <th>Destination</th>
            <th>Protocol</th>
            <th>Length</th>
            <th>Info</th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="packet in packets" 
            :key="packet.id"
            :class="['packet-row', { 
              'selected': selectedPacket?.id === packet.id,
              'tcp': packet.protocol === 'TCP',
              'udp': packet.protocol === 'UDP',
              'icmp': packet.protocol === 'ICMP',
              'http': packet.info.toLowerCase().includes('http')
            }]"
            @click="selectPacket(packet)"
          >
            <td class="packet-number">{{ packet.number }}</td>
            <td class="packet-time">{{ formatTime(packet.timestamp) }}</td>
            <td class="packet-source">{{ packet.source }}</td>
            <td class="packet-destination">{{ packet.destination }}</td>
            <td class="packet-protocol">{{ packet.protocol }}</td>
            <td class="packet-length">{{ packet.length }}</td>
            <td class="packet-info">{{ packet.info }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <div class="packet-list-footer" v-if="packets.length > 0">
      <span>Total: {{ packets.length }} packets</span>
      <button @click="scrollToBottom" class="btn-scroll">⬇️ Scroll to bottom</button>
    </div>
  </div>
</template>

<script>
import { ref, nextTick } from 'vue'

export default {
  name: 'PacketList',
  props: {
    packets: {
      type: Array,
      default: () => []
    },
    selectedPacket: {
      type: Object,
      default: null
    }
  },
  emits: ['packet-selected', 'clear-packets'],
  setup(props, { emit }) {
    const selectPacket = (packet) => {
      emit('packet-selected', packet)
    }
    
    const clearPackets = () => {
      emit('clear-packets')
    }
    
    const formatTime = (timestamp) => {
      const date = new Date(timestamp)
      return date.toLocaleTimeString() + '.' + date.getMilliseconds().toString().padStart(3, '0')
    }
    
    const scrollToBottom = async () => {
      await nextTick()
      const container = document.querySelector('.packet-table-container')
      if (container) {
        container.scrollTop = container.scrollHeight
      }
    }
    
    return {
      selectPacket,
      clearPackets,
      formatTime,
      scrollToBottom
    }
  }
}
</script>

<style scoped>
.packet-list {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #1a1a1a;
}

.packet-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: #2d2d2d;
  border-bottom: 1px solid #444;
}

.packet-list-header h3 {
  color: #4CAF50;
  margin: 0;
}

.btn-clear {
  background-color: #f44336;
  color: white;
  border: none;
  padding: 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
}

.btn-clear:hover {
  background-color: #d32f2f;
}

.packet-table-container {
  flex: 1;
  overflow: auto;
}

.packet-table {
  width: 100%;
  border-collapse: collapse;
  font-family: monospace;
  font-size: 0.9rem;
}

.packet-table th {
  background-color: #333;
  color: #e0e0e0;
  padding: 0.5rem;
  text-align: left;
  border-bottom: 2px solid #555;
  position: sticky;
  top: 0;
  z-index: 10;
}

.packet-table td {
  padding: 0.3rem 0.5rem;
  border-bottom: 1px solid #333;
  color: #e0e0e0;
}

.packet-row {
  cursor: pointer;
  transition: background-color 0.1s;
}

.packet-row:hover {
  background-color: #2d2d2d;
}

.packet-row.selected {
  background-color: #4CAF50 !important;
  color: white;
}

.packet-row.tcp {
  border-left: 3px solid #2196F3;
}

.packet-row.udp {
  border-left: 3px solid #FF9800;
}

.packet-row.icmp {
  border-left: 3px solid #f44336;
}

.packet-row.http {
  border-left: 3px solid #9C27B0;
}

.packet-number {
  text-align: right;
  width: 60px;
  font-weight: bold;
}

.packet-time {
  width: 120px;
  color: #888;
}

.packet-source,
.packet-destination {
  width: 140px;
  font-weight: bold;
}

.packet-protocol {
  width: 80px;
  text-align: center;
  font-weight: bold;
}

.packet-length {
  width: 80px;
  text-align: right;
}

.packet-info {
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.packet-list-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem;
  background-color: #2d2d2d;
  border-top: 1px solid #444;
  color: #888;
  font-size: 0.9rem;
}

.btn-scroll {
  background-color: #2196F3;
  color: white;
  border: none;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
}

.btn-scroll:hover {
  background-color: #1976D2;
}
</style>