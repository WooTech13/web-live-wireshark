<template>
  <div class="capture-controls">
    <button
      v-if="!isCapturing"
      @click="$emit('start')"
      class="btn-control btn-start"
      title="Start capture"
    >
      ▶️ Start
    </button>
    
    <template v-else>
      <button
        v-if="!isPaused"
        @click="$emit('pause')"
        class="btn-control btn-pause"
        title="Pause capture"
      >
        ⏸️ Pause
      </button>
      
      <button
        v-else
        @click="$emit('resume')"
        class="btn-control btn-resume"
        title="Resume capture"
      >
        ▶️ Resume
      </button>
      
      <button
        @click="$emit('stop')"
        class="btn-control btn-stop"
        title="Stop capture"
      >
        ⏹️ Stop
      </button>
    </template>
    
    <div class="export-controls" v-if="isCapturing || packets.length > 0">
      <label>Export:</label>
      <button
        @click="$emit('export', 'pcap')"
        class="btn-export"
        title="Export as PCAP"
      >
        📄 PCAP
      </button>
      <button
        @click="$emit('export', 'json')"
        class="btn-export"
        title="Export as JSON"
      >
        📄 JSON
      </button>
      <button
        @click="$emit('export', 'csv')"
        class="btn-export"
        title="Export as CSV"
      >
        📄 CSV
      </button>
    </div>
    
    <div class="status-indicator">
      <div 
        :class="['status-dot', statusClass]"
        :title="statusText"
      ></div>
      <span class="status-text">{{ statusText }}</span>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'CaptureControls',
  props: {
    isCapturing: {
      type: Boolean,
      default: false
    },
    isPaused: {
      type: Boolean,
      default: false
    },
    packets: {
      type: Array,
      default: () => []
    }
  },
  emits: ['start', 'stop', 'pause', 'resume', 'export'],
  setup(props) {
    const statusClass = computed(() => {
      if (!props.isCapturing) return 'status-stopped'
      if (props.isPaused) return 'status-paused'
      return 'status-capturing'
    })
    
    const statusText = computed(() => {
      if (!props.isCapturing) return 'Stopped'
      if (props.isPaused) return 'Paused'
      return 'Capturing'
    })
    
    return {
      statusClass,
      statusText
    }
  }
}
</script>

<style scoped>
.capture-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.btn-control {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.2s;
}

.btn-start {
  background-color: #4CAF50;
  color: white;
}

.btn-start:hover {
  background-color: #45a049;
}

.btn-pause {
  background-color: #FF9800;
  color: white;
}

.btn-pause:hover {
  background-color: #F57C00;
}

.btn-resume {
  background-color: #2196F3;
  color: white;
}

.btn-resume:hover {
  background-color: #1976D2;
}

.btn-stop {
  background-color: #f44336;
  color: white;
}

.btn-stop:hover {
  background-color: #d32f2f;
}

.export-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding-left: 1rem;
  border-left: 1px solid #555;
}

.export-controls label {
  color: #e0e0e0;
  font-weight: bold;
}

.btn-export {
  background-color: #9C27B0;
  color: white;
  border: none;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
}

.btn-export:hover {
  background-color: #7B1FA2;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding-left: 1rem;
  border-left: 1px solid #555;
}

.status-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

.status-stopped {
  background-color: #666;
  animation: none;
}

.status-paused {
  background-color: #FF9800;
  animation: none;
}

.status-capturing {
  background-color: #4CAF50;
}

.status-text {
  color: #e0e0e0;
  font-weight: bold;
  font-size: 0.9rem;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}
</style>