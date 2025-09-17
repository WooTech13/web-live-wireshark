import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import './style.css'

// Import des composants principaux
import Login from './components/Login.vue'
import Dashboard from './components/Dashboard.vue'

console.log('🚀 Wireshark Web - Starting application...')

// Configuration du routeur Vue
const routes = [
  { path: '/', name: 'Home', component: Dashboard },
  { path: '/login', name: 'Login', component: Login },
  { path: '/dashboard', name: 'Dashboard', component: Dashboard }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Garde de navigation pour l'authentification
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const isAuthenticated = !!token
  
  console.log(`🛣️ Navigation: ${from.path || '/'} → ${to.path}`)
  console.log(`🔐 Authenticated: ${isAuthenticated}`)
  
  // Routes qui nécessitent une authentification
  const protectedRoutes = ['/', '/dashboard']
  
  if (protectedRoutes.includes(to.path) && !isAuthenticated) {
    console.log('🚫 Access denied - redirecting to login')
    next('/login')
  } else if (to.path === '/login' && isAuthenticated) {
    console.log('✅ Already authenticated - redirecting to dashboard')
    next('/dashboard')
  } else {
    next()
  }
})

// Plugin global pour les utilitaires
const globalPlugin = {
  install(app) {
    // Méthodes globales disponibles dans tous les composants
    app.config.globalProperties.$formatTime = (timestamp) => {
      return new Date(timestamp).toLocaleString('fr-FR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        fractionalSecondDigits: 3
      })
    }
    
    app.config.globalProperties.$formatBytes = (bytes) => {
      if (bytes === 0) return '0 B'
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }
    
    app.config.globalProperties.$debounce = (func, wait) => {
      let timeout
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout)
          func(...args)
        }
        clearTimeout(timeout)
        timeout = setTimeout(later, wait)
      }
    }
  }
}

// Fonction pour supprimer le loading screen
function removeLoadingScreen() {
  console.log('🗑️ Removing loading screen...')
  const loading = document.getElementById('loading')
  if (loading) {
    loading.style.opacity = '0'
    setTimeout(() => {
      loading.remove()
      console.log('✅ Loading screen removed')
    }, 300)
  }
}

// Gestion d'erreur globale Vue
const errorHandler = (err, instance, info) => {
  console.error('🚨 Vue Error:', err)
  console.error('📍 Component:', instance?.$options.name || 'Unknown')
  console.error('📝 Info:', info)
  
  // Afficher une notification d'erreur à l'utilisateur
  if (window.showToast) {
    window.showToast(`Error: ${err.message}`, 'error')
  }
}

// Fonction principale d'initialisation
async function initializeApp() {
  try {
    console.log('🔧 Creating Vue application...')
    
    // Créer l'application Vue
    const app = createApp(App)
    
    // Configuration de l'application
    app.config.errorHandler = errorHandler
    app.config.performance = process.env.NODE_ENV === 'development'
    
    // Installation des plugins
    app.use(router)
    app.use(globalPlugin)
    
    // Propriétés globales additionnelles
    app.provide('apiUrl', import.meta.env.VITE_API_URL || 'http://localhost:3000/api')
    app.provide('wsUrl', import.meta.env.VITE_WS_URL || 'http://localhost:3000')
    
    console.log('🔧 Mounting Vue application...')
    
    // Monter l'application
    app.mount('#app')
    
    console.log('✅ Vue application mounted successfully')
    
    // Supprimer le loading screen après un court délai
    setTimeout(removeLoadingScreen, 800)
    
    // Configuration des événements globaux
    setupGlobalEventListeners()
    
    // Vérifier la connectivité backend
    await checkBackendHealth()
    
  } catch (error) {
    console.error('❌ Failed to initialize application:', error)
    
    // Afficher une erreur à l'utilisateur
    document.getElementById('app').innerHTML = `
      <div style="
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        background: #1a1a1a;
        color: #e0e0e0;
        font-family: Arial, sans-serif;
        text-align: center;
        padding: 2rem;
      ">
        <div style="
          background: #2d2d2d;
          padding: 2rem;
          border-radius: 8px;
          border-left: 4px solid #f44336;
        ">
          <h1 style="color: #f44336; margin-bottom: 1rem;">⚠️ Application Error</h1>
          <p>Failed to load Wireshark Web application.</p>
          <p style="margin-top: 1rem; font-family: monospace; color: #888;">
            ${error.message}
          </p>
          <button onclick="location.reload()" style="
            background: #4CAF50;
            color: white;
            border: none;
            padding: 1rem 2rem;
            border-radius: 4px;
            cursor: pointer;
            margin-top: 1rem;
          ">
            🔄 Reload Page
          </button>
        </div>
      </div>
    `
    
    removeLoadingScreen()
  }
}

// Configuration des événements globaux
function setupGlobalEventListeners() {
  console.log('🎧 Setting up global event listeners...')
  
  // Gestion de la perte de connexion
  window.addEventListener('offline', () => {
    console.log('📡 Connection lost')
    if (window.showToast) {
      window.showToast('Connection lost - working offline', 'warning')
    }
  })
  
  window.addEventListener('online', () => {
    console.log('📡 Connection restored')
    if (window.showToast) {
      window.showToast('Connection restored', 'success')
    }
  })
  
  // Gestion des erreurs non capturées
  window.addEventListener('unhandledrejection', (event) => {
    console.error('🚨 Unhandled Promise Rejection:', event.reason)
    event.preventDefault()
  })
  
  // Raccourcis clavier
  document.addEventListener('keydown', (event) => {
    // Ctrl+Shift+D pour basculer en mode debug
    if (event.ctrlKey && event.shiftKey && event.key === 'D') {
      const debugMode = localStorage.getItem('debug') === 'true'
      localStorage.setItem('debug', !debugMode)
      console.log(`🐛 Debug mode: ${!debugMode ? 'ON' : 'OFF'}`)
      location.reload()
    }
  })
}

// Vérification de la santé du backend
async function checkBackendHealth() {
  try {
    console.log('🏥 Checking backend health...')
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
    
    const response = await fetch(`${apiUrl}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 5000
    })
    
    if (response.ok) {
      const health = await response.json()
      console.log('✅ Backend health check passed:', health)
    } else {
      console.warn('⚠️ Backend health check failed:', response.status)
    }
  } catch (error) {
    console.warn('⚠️ Backend health check error:', error.message)
  }
}

// Initialiser l'application au chargement du DOM
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp)
} else {
  initializeApp()
}

// Export pour les tests
export { initializeApp, removeLoadingScreen }