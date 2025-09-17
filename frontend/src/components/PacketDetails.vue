<template>
  <div class="packet-details">
    <div class="packet-details-header">
      <h3>🔍 Packet Details</h3>
      <button @click="$emit('close')" class="btn-close" title="Close details">
        ❌
      </button>
    </div>
    
    <div class="packet-details-content">
      <!-- Packet Summary -->
      <div class="packet-summary">
        <h4>📋 Summary</h4>
        <div class="summary-grid">
          <div class="summary-item">
            <span class="label">Number:</span>
            <span class="value">{{ packet.number }}</span>
          </div>
          <div class="summary-item">
            <span class="label">Time:</span>
            <span class="value">{{ formatTime(packet.timestamp) }}</span>
          </div>
          <div class="summary-item">
            <span class="label">Source:</span>
            <span class="value">{{ packet.source }}</span>
          </div>
          <div class="summary-item">
            <span class="label">Destination:</span>
            <span class="value">{{ packet.destination }}</span>
          </div>
          <div class="summary-item">
            <span class="label">Protocol:</span>
            <span class="value">{{ packet.protocol }}</span>
          </div>
          <div class="summary-item">
            <span class="label">Length:</span>
            <span class="value">{{ packet.length }} bytes</span>
          </div>
        </div>
      </div>
      
      <!-- Layer Analysis -->
      <div class="layer-analysis">
        <h4>🔬 Layer Analysis</h4>
        <div 
          v-for="(layer, layerName) in packet.layers" 
          :key="layerName"
          class="layer-section"
        >
          <div 
            class="layer-header"
            @click="toggleLayer(layerName)"
            :class="{ expanded: expandedLayers[layerName] }"
          >
            <span class="layer-toggle">{{ expandedLayers[layerName] ? '▼' : '▶' }}</span>
            <span class="layer-name">{{ layer.name || layerName.toUpperCase() }}</span>
            <span class="layer-count">({{ Object.keys(layer.fields || {}).length }} fields)</span>
          </div>
          
          <div 
            v-if="expandedLayers[layerName]" 
            class="layer-content"
          >
            <div 
              v-for="(value, fieldName) in layer.fields" 
              :key="fieldName"
              class="field-item"
            >
              <span class="field-name">{{ fieldName }}:</span>
              <span class="field-value">{{ formatFieldValue(value) }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Hex Dump -->
      <div class="hex-dump">
        <h4>🔢 Hex Dump</h4>
        <div class="hex-content">
          <pre>{{ generateHexDump() }}</pre>
        </div>
      </div>
      
      <!-- Raw Data -->
      <div class="raw-data">
        <h4>📝 Raw JSON</h4>
        <div class="raw-content">
          <pre>{{ JSON.stringify(packet.raw, null, 2) }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'

export default {
  name: 'PacketDetails',
  props: {
    packet: {
      type: Object,
      required: true
    }
  },
  emits: ['close'],
  setup(props) {
    const expandedLayers = reactive({})
    
    const toggleLayer = (layerName) => {
      expandedLayers[layerName] = !expandedLayers[layerName]
    }
    
    const formatTime = (timestamp) => {
      const date = new Date(timestamp)
      return date.toLocaleString() + '.' + date.getMilliseconds().toString().padStart(3, '0')
    }
    
    const formatFieldValue = (value) => {
      if (typeof value === 'object') {
        return JSON.stringify(value, null, 2)
      }
      return String(value)
    }
    
    const generateHexDump = () => {
      // Simulation d'un hex dump basique
      // Dans un vrai projet, cela viendrait des données brutes du paquet
      const dummyData = new Array(16).fill(0).map(() => 
        Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
      ).join(' ')
      
      return `0000: ${dummyData.substring(0, 23)}  ${dummyData.substring(24)}
0010: ${dummyData.substring(0, 23)}  ${dummyData.substring(24)}
0020: ${dummyData.substring(0, 23)}  ${dummyData.substring(24)}`
    }
    
    return {
      expandedLayers,
      toggleLayer,
      formatTime,
      formatFieldValue,
      generateHexDump
    }
  }
}
</script>

<style scoped>
.packet-details {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #2d2d2d;
}

.packet-details-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: #333;
  border-bottom: 1px solid #555;
}

.packet-details-header h3 {
  color: #4CAF50;
  margin: 0;
}

.btn-close {
  background: none;
  border: none;
  color: #f44336;
  cursor: pointer;
  font-size: 1rem;
  padding: 0.25rem;
}

.btn-close:hover {
  background-color: #444;
  border-radius: 4px;
}

.packet-details-content {
  flex: 1;
  overflow: auto;
  padding: 1rem;
}

.packet-summary {
  margin-bottom: 2rem;
}

.packet-summary h4 {
  color: #e0e0e0;
  margin-bottom: 1rem;
  border-bottom: 1px solid #555;
  padding-bottom: 0.5rem;
}

.summary-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  padding: 0.25rem 0;
}

.summary-item .label {
  color: #888;
  font-weight: bold;
}

.summary-item .value {
  color: #e0e0e0;
  font-family: monospace;
}

.layer-analysis {
  margin-bottom: 2rem;
}

.layer-analysis h4 {
  color: #e0e0e0;
  margin-bottom: 1rem;
  border-bottom: 1px solid #555;
  padding-bottom: 0.5rem;
}

.layer-section {
  margin-bottom: 1rem;
  border: 1px solid #555;
  border-radius: 4px;
}

.layer-header {
  padding: 0.75rem;
  background-color: #333;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background-color 0.2s;
}

.layer-header:hover {
  background-color: #444;
}

.layer-header.expanded {
  border-bottom: 1px solid #555;
}

.layer-toggle {
  color: #4CAF50;
  font-weight: bold;
}

.layer-name {
  color: #e0e0e0;
  font-weight: bold;
}

.layer-count {
  color: #888;
  font-size: 0.9rem;
}

.layer-content {
  padding: 1rem;
  background-color: #1a1a1a;
}

.field-item {
  display: flex;
  margin-bottom: 0.5rem;
  padding: 0.25rem 0;
  border-bottom: 1px solid #333;
}

.field-name {
  color: #888;
  font-weight: bold;
  min-width: 150px;
  font-family: monospace;
}

.field-value {
  color: #e0e0e0;
  font-family: monospace;
  word-break: break-all;
}

.hex-dump,
.raw-data {
  margin-bottom: 2rem;
}

.hex-dump h4,
.raw-data h4 {
  color: #e0e0e0;
  margin-bottom: 1rem;
  border-bottom: 1px solid #555;
  padding-bottom: 0.5rem;
}

.hex-content,
.raw-content {
  background-color: #1a1a1a;
  border: 1px solid #555;
  border-radius: 4px;
  padding: 1rem;
  overflow: auto;
  max-height: 300px;
}

.hex-content pre,
.raw-content pre {
  color: #e0e0e0;
  font-family: monospace;
  font-size: 0.8rem;
  margin: 0;
  white-space: pre-wrap;
}
</style>