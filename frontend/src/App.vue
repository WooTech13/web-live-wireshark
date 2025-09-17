<template>
  <div id="app">
    <!-- Header -->
    <header class="header">
      <h1>🦈 Wireshark Web</h1>
      <div v-if="user" class="user-info">
        Welcome, {{ user.username }}
        <button @click="logout" class="btn-logout">Logout</button>
      </div>
    </header>

    <!-- Login Component -->
    <Login v-if="!isAuthenticated" @login="handleLogin" />

    <!-- Main Application -->
    <div v-else class="main-container">
      <!-- Controls Section -->
      <div class="controls-section">
        <InterfaceSelector 
          :interfaces="interfaces" 
          :selectedInterface="selectedInterface"
          @interface-selected="handleInterfaceSelection"
        />
        <FilterBar 
          :filter="currentFilter"
          @filter-changed="handleFilterChange"
        />
        <CaptureControls 
          :isCapturing="isCapturing"
          :isPaused="isPaused"
          @start="startCapture"
          @stop="stopCapture"
          @pause="pauseCapture"
          @resume="resumeCapture"
          @export="exportCapture"
        />
      </div>

      <!-- Stats Section -->
      <div class="stats-section" v-if="captureStats">
        <div class="stat-item">
          <span class="stat-label">Packets:</span>
          <span class="stat-value">{{ captureStats.totalPackets }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Duration:</span>
          <span class="stat-value">{{ formatDuration(captureStats.duration) }}</span>
        </div>
      </div>

      <!-- Packet List and Details -->
      <div class="content-section">
        <div class="packet-list-container">
          <PacketList 
            :packets="packets"
            :selectedPacket="selectedPacket"
            @packet-selected="handlePacketSelection"
          />
        </div>
        <div class="packet-details-container" v-if="selectedPacket">
          <PacketDetails :packet="selectedPacket" />
        </div>
      </div>
    </div>

    <!-- Toast Notifications -->
    <div class="toast-container">
      <div 
        v-for="toast in toasts" 
        :key="toast.id"
        :class="['toast', `toast-${toast.type}`]"
      >
        {{ toast.message }}
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import Login from './components/Login.vue'
import InterfaceSelector from './components/InterfaceSelector.vue'
import FilterBar from './components/FilterBar.vue'
import CaptureControls from './components/CaptureControls.vue'
import PacketList from './components/PacketList.vue'
import PacketDetails from './components/PacketDetails.vue'
import WebSocketService from './services/websocket.js'

export default {
  name: 'App',
  components: {
    Login,
    InterfaceSelector,
    FilterBar,
    CaptureControls,
    PacketList,
    PacketDetails
  },
  setup() {
    // State
    const isAuthenticated = ref(false)
    const user = ref(null)
    const interfaces = ref([])
    const selectedInterface = ref(null)
    const currentFilter = ref('')
    const isCapturing = ref(false)
    const isPaused = ref(false)
    const packets = ref([])
    const selectedPacket = ref(null)
    const captureStats = ref(null)
    const toasts = ref([])

    let wsService = null

    // Methods
    const handleLogin = (userData) => {
      user.value = userData.user
      isAuthenticated.value = true
      localStorage.setItem('token', userData.token)
      initializeWebSocket(userData.token)
    }

    const logout = () => {
      user.value = null
      isAuthenticated.value = false
      localStorage.removeItem('token')
      if (wsService) {
        wsService.disconnect()
      }
    }

    const initializeWebSocket = (token) => {
      wsService = new WebSocketService(token)
      
      // Event listeners
      wsService.on('interfaces-list', (interfacesList) => {
        interfaces.value = interfacesList
      })

      wsService.on('capture-started', (data) => {
        isCapturing.value = true
        isPaused.value = false
        packets.value = []
        showToast('Capture started successfully', 'success')
      })

      wsService.on('packet-captured', (packet) => {
        packets.value.push(packet)
        // Limiter à 1000 paquets pour les performances
        if (packets.value.length > 1000) {
          packets.value.shift()
        }
      })

      wsService.on('capture-stats', (stats) => {
        captureStats.value = stats
      })

      wsService.on('capture-stopped', () => {
        isCapturing.value = false
        isPaused.value = false
        showToast('Capture stopped', 'info')
      })

      wsService.on('capture-error', (error) => {
        showToast(`Capture error: ${error}`, 'error')
      })

      wsService.on('export-complete', (data) => {
        showToast(`Export completed: ${data.file}`, 'success')
      })

      // Get interfaces on connection
      wsService.emit('get-interfaces')
    }

    const handleInterfaceSelection = (iface) => {
      selectedInterface.value = iface
    }

    const handleFilterChange = (filter) => {
      currentFilter.value = filter
    }

    const startCapture = () => {
      if (!selectedInterface.value) {
        showToast('Please select an interface', 'error')
        return
      }

      wsService.emit('start-capture', {
        interface: selectedInterface.value.name,
        filter: currentFilter.value
      })
    }

    const stopCapture = () => {
      wsService.emit('stop-capture')
    }

    const pauseCapture = () => {
      wsService.emit('pause-capture')
      isPaused.value = true
    }

    const resumeCapture = () => {
      wsService.emit('resume-capture')
      isPaused.value = false
    }

    const exportCapture = (format) => {
      wsService.emit('export-capture', format)
    }

    const handlePacketSelection = (packet) => {
      selectedPacket.value = packet
    }

    const formatDuration = (ms) => {
      const seconds = Math.floor(ms / 1000)
      const minutes = Math.floor(seconds / 60)
      const hours = Math.floor(minutes / 60)
      
      if (hours > 0) {
        return `${hours}h ${minutes % 60}m ${seconds % 60}s`
      } else if (minutes > 0) {
        return `${minutes}m ${seconds % 60}s`
      } else {
        return `${seconds}s`
      }
    }

    const showToast = (message, type = 'info') => {
      const toast = {
        id: Date.now(),
        message,
        type
      }
      toasts.value.push(toast)
      
      setTimeout(() => {
        const index = toasts.value.findIndex(t => t.id === toast.id)
        if (index > -1) {
          toasts.value.splice(index, 1)
        }
      }, 5000)
    }

    // Lifecycle
    onMounted(() => {
      const token = localStorage.getItem('token')
      if (token) {
        // Verify token validity here if needed
        const userData = { token, user: { username: 'User' } }
        handleLogin(userData)
      }
    })

    onUnmounted(() => {
      if (wsService) {
        wsService.disconnect()
      }
    })

    return {
      isAuthenticated,
      user,
      interfaces,
      selectedInterface,
      currentFilter,
      isCapturing,
      isPaused,
      packets,
      selectedPacket,
      captureStats,
      toasts,
      handleLogin,
      logout,
      handleInterfaceSelection,
      handleFilterChange,
      startCapture,
      stopCapture,
      pauseCapture,
      resumeCapture,
      exportCapture,
      handlePacketSelection,
      formatDuration
    }
  }
}
</script>

<style>
/* Global Styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #1a1a1a;
  color: #e0e0e0;
}

#app {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  background-color: #2d2d2d;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #444;
}

.header h1 {
  color: #4CAF50;
  font-size: 1.5rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.btn-logout {
  background-color: #f44336;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.btn-logout:hover {
  background-color: #d32f2f;
}

.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.controls-section {
  background-color: #2d2d2d;
  padding: 1rem 2rem;
  border-bottom: 1px solid #444;
  display: flex;
  gap: 2rem;
  align-items: center;
  flex-wrap: wrap;
}

.stats-section {
  background-color: #333;
  padding: 0.5rem 2rem;
  display: flex;
  gap: 2rem;
  border-bottom: 1px solid #444;
}

.stat-item {
  display: flex;
  gap: 0.5rem;
}

.stat-label {
  font-weight: bold;
  color: #888;
}

.stat-value {
  color: #4CAF50;
  font-weight: bold;
}

.content-section {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.packet-list-container {
  flex: 1;
  border-right: 1px solid #444;
}

.packet-details-container {
  width: 400px;
  background-color: #2d2d2d;
}

.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
}

.toast {
  background-color: #333;
  color: white;
  padding: 1rem;
  margin-bottom: 0.5rem;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  min-width: 300px;
}

.toast-success {
  border-left: 4px solid #4CAF50;
}

.toast-error {
  border-left: 4px solid #f44336;
}

.toast-info {
  border-left: 4px solid #2196F3;
}
</style>