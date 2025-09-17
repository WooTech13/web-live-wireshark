import { io } from 'socket.io-client'

class WebSocketService {
  constructor(token) {
    this.socket = null
    this.token = token
    this.listeners = new Map()
    this.connect()
  }

  connect() {
    this.socket = io('http://localhost:3000', {
      auth: {
        token: this.token
      }
    })

    this.socket.on('connect', () => {
      console.log('Connected to server')
    })

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server')
    })

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error)
    })

    // Forward all events to registered listeners
    this.socket.onAny((eventName, ...args) => {
      const listeners = this.listeners.get(eventName) || []
      listeners.forEach(callback => callback(...args))
    })
  }

  on(eventName, callback) {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, [])
    }
    this.listeners.get(eventName).push(callback)
  }

  off(eventName, callback) {
    const listeners = this.listeners.get(eventName) || []
    const index = listeners.indexOf(callback)
    if (index > -1) {
      listeners.splice(index, 1)
    }
  }

  emit(eventName, data) {
    if (this.socket) {
      this.socket.emit(eventName, data)
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }
}

export default WebSocketService