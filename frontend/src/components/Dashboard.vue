<template>
  <div class="dashboard">
    <header class="dashboard-header">
      <h1>🦈 Wireshark Web Dashboard</h1>
      <div class="header-controls">
        <span class="status-indicator" :class="connectionStatus">
          {{ connectionStatus === 'connected' ? '🟢' : '🔴' }} 
          {{ connectionStatus }}
        </span>
        <button @click="logout" class="btn btn-outline btn-sm">Logout</button>
      </div>
    </header>

    <main class="dashboard-main">
      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <h3>Active Sessions</h3>
          <div class="stat-value">{{ stats.activeSessions }}</div>
        </div>
        <div class="stat-card">
          <h3>Packets Captured</h3>
          <div class="stat-value">{{ stats.packetsCount }}</div>
        </div>
        <div class="stat-card">
          <h3>Data Volume</h3>
          <div class="stat-value">{{ formatBytes(stats.dataVolume) }}</div>
        </div>
        <div class="stat-card">
          <h3>Uptime</h3>
          <div class="stat-value">{{ uptime }}</div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions">
        <h2>Quick Actions</h2>
        <div class="actions-grid">
          <button @click="startCapture" class="action-btn">
            <span class="icon">▶️</span>
            <span>Start Capture</span>
          </button>
          <button @click="viewInterfaces" class="action-btn">
            <span class="icon">🌐</span>
            <span>Network Interfaces</span>
          </button>
          <button @click="openFilters" class="action-btn">
            <span class="icon">🔍</span>
            <span>Configure Filters</span>
          </button>
          <button @click="exportData" class="action-btn">
            <span class="icon">📄</span>
            <span>Export Data</span>
          </button>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="recent-activity">
        <h2>Recent Activity</h2>
        <div class="activity-log">
          <div v-for="activity in recentActivities" :key="activity.id" class="activity-item">
            <span class="activity-time">{{ formatTime(activity.timestamp) }}</span>
            <span class="activity-message">{{ activity.message }}</span>
            <span class="activity-type" :class="activity.type">{{ activity.type }}</span>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, computed } from 'vue'

export default {
  name: 'Dashboard',
  setup() {
    // État réactif
    const connectionStatus = ref('connecting')
    const stats = ref({
      activeSessions: 0,
      packetsCount: 0,
      dataVolume: 0
    })
    const startTime = ref(Date.now())
    const recentActivities = ref([
      {
        id: 1,
        timestamp: Date.now() - 5000,
        message: 'Application started',
        type: 'info'
      },
      {
        id: 2,
        timestamp: Date.now() - 3000,
        message: 'Backend connection established',
        type: 'success'
      }
    ])

    // Computed
    const uptime = computed(() => {
      const now = Date.now()
      const diff = now - startTime.value
      const minutes = Math.floor(diff / 60000)
      const seconds = Math.floor((diff % 60000) / 1000)
      return `${minutes}m ${seconds}s`
    })

    // Méthodes
    const formatBytes = (bytes) => {
      if (bytes === 0) return '0 B'
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    const formatTime = (timestamp) => {
      return new Date(timestamp).toLocaleTimeString()
    }

    const startCapture = () => {
      console.log('🎯 Start capture clicked')
      addActivity('Capture session started', 'success')
      stats.value.activeSessions++
    }

    const viewInterfaces = () => {
      console.log('🌐 View interfaces clicked')
      addActivity('Viewing network interfaces', 'info')
    }

    const openFilters = () => {
      console.log('🔍 Open filters clicked')
      addActivity('Filter configuration opened', 'info')
    }

    const exportData = () => {
      console.log('📄 Export data clicked')
      addActivity('Data export initiated', 'info')
    }

    const logout = () => {
      console.log('👋 Logout clicked')
      // TODO: Implémenter la déconnexion
    }

    const addActivity = (message, type = 'info') => {
      const newActivity = {
        id: Date.now(),
        timestamp: Date.now(),
        message,
        type
      }
      recentActivities.value.unshift(newActivity)
      
      // Garder seulement les 10 dernières activités
      if (recentActivities.value.length > 10) {
        recentActivities.value = recentActivities.value.slice(0, 10)
      }
    }

    // Simulation de données en temps réel
    let statsInterval
    let uptimeInterval

    onMounted(() => {
      console.log('✅ Dashboard mounted')
      
      // Simuler la connexion
      setTimeout(() => {
        connectionStatus.value = 'connected'
        addActivity('Dashboard loaded successfully', 'success')
      }, 1000)

      // Mettre à jour les stats périodiquement
      statsInterval = setInterval(() => {
        stats.value.packetsCount += Math.floor(Math.random() * 10)
        stats.value.dataVolume += Math.floor(Math.random() * 1024)
      }, 2000)

      // Mettre à jour l'uptime
      uptimeInterval = setInterval(() => {
        // Le computed se met automatiquement à jour
      }, 1000)
    })

    onUnmounted(() => {
      if (statsInterval) clearInterval(statsInterval)
      if (uptimeInterval) clearInterval(uptimeInterval)
    })

    return {
      connectionStatus,
      stats,
      uptime,
      recentActivities,
      formatBytes,
      formatTime,
      startCapture,
      viewInterfaces,
      openFilters,
      exportData,
      logout
    }
  }
}
</script>

<style scoped>
.dashboard {
  min-height: 100vh;
  background: var(--bg-primary);
}

.dashboard-header {
  background: var(--bg-secondary);
  padding: 1.5rem 2rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dashboard-header h1 {
  color: var(--primary-color);
  font-size: 2rem;
  margin: 0;
}

.header-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.status-indicator {
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius);
  font-weight: 500;
}

.status-indicator.connected {
  background: rgba(76, 175, 80, 0.1);
  color: var(--success-color);
}

.status-indicator.connecting {
  background: rgba(255, 152, 0, 0.1);
  color: var(--warning-color);
}

.dashboard-main {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.stat-card {
  background: var(--bg-secondary);
  padding: 1.5rem;
  border-radius: var(--border-radius);
  border: 1px solid var(--border-color);
  text-align: center;
}

.stat-card h3 {
  color: var(--text-secondary);
  margin-bottom: 1rem;
  font-size: 1rem;
  font-weight: 500;
}

.stat-value {
  color: var(--primary-color);
  font-size: 2rem;
  font-weight: bold;
}

.quick-actions {
  margin-bottom: 3rem;
}

.quick-actions h2 {
  color: var(--text-primary);
  margin-bottom: 1.5rem;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.action-btn {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  padding: 1.5rem;
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: var(--transition);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-primary);
}

.action-btn:hover {
  background: var(--bg-tertiary);
  border-color: var(--primary-color);
}

.action-btn .icon {
  font-size: 1.5rem;
}

.recent-activity h2 {
  color: var(--text-primary);
  margin-bottom: 1.5rem;
}

.activity-log {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  overflow: hidden;
}

.activity-item {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
  align-items: center;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-time {
  color: var(--text-muted);
  font-size: 0.875rem;
  font-family: var(--font-mono);
}

.activity-message {
  color: var(--text-primary);
}

.activity-type {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
}

.activity-type.success {
  background: rgba(76, 175, 80, 0.1);
  color: var(--success-color);
}

.activity-type.info {
  background: rgba(33, 150, 243, 0.1);
  color: var(--info-color);
}

.activity-type.error {
  background: rgba(244, 67, 54, 0.1);
  color: var(--error-color);
}

/* Responsive */
@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .dashboard-main {
    padding: 1rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .actions-grid {
    grid-template-columns: 1fr;
  }
}
</style>