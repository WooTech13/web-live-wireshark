<template>
  <div class="login-container">
    <div class="login-form">
      <h2>Login to Wireshark Web</h2>
      
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="username">Username:</label>
          <input
            id="username"
            v-model="form.username"
            type="text"
            required
            placeholder="Enter username"
          />
        </div>
        
        <div class="form-group">
          <label for="password">Password:</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            required
            placeholder="Enter password"
          />
        </div>
        
        <button type="submit" :disabled="isLoading" class="btn-primary">
          {{ isLoading ? 'Logging in...' : 'Login' }}
        </button>
      </form>
      
      <div class="register-link">
        Don't have an account? 
        <button @click="toggleMode" class="link-button">Register here</button>
      </div>
      
      <!-- Register Form -->
      <form v-if="isRegisterMode" @submit.prevent="handleRegister" class="register-form">
        <h3>Register New Account</h3>
        <div class="form-group">
          <label for="reg-username">Username:</label>
          <input
            id="reg-username"
            v-model="registerForm.username"
            type="text"
            required
            placeholder="Choose username"
          />
        </div>
        
        <div class="form-group">
          <label for="reg-email">Email:</label>
          <input
            id="reg-email"
            v-model="registerForm.email"
            type="email"
            placeholder="Enter email (optional)"
          />
        </div>
        
        <div class="form-group">
          <label for="reg-password">Password:</label>
          <input
            id="reg-password"
            v-model="registerForm.password"
            type="password"
            required
            placeholder="Choose password"
          />
        </div>
        
        <button type="submit" :disabled="isLoading" class="btn-primary">
          {{ isLoading ? 'Creating Account...' : 'Register' }}
        </button>
      </form>
      
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import axios from 'axios'

export default {
  name: 'Login',
  emits: ['login'],
  setup(_, { emit }) {
    const isLoading = ref(false)
    const error = ref('')
    const isRegisterMode = ref(false)
    
    const form = reactive({
      username: '',
      password: ''
    })
    
    const registerForm = reactive({
      username: '',
      email: '',
      password: ''
    })
    
    const handleSubmit = async () => {
      isLoading.value = true
      error.value = ''
      
      try {
        const response = await axios.post('http://localhost:3000/api/auth/login', {
          username: form.username,
          password: form.password
        })
        
        emit('login', response.data)
      } catch (err) {
        error.value = err.response?.data?.error || 'Login failed'
      } finally {
        isLoading.value = false
      }
    }
    
    const handleRegister = async () => {
      isLoading.value = true
      error.value = ''
      
      try {
        const response = await axios.post('http://localhost:3000/api/auth/register', registerForm)
        emit('login', response.data)
      } catch (err) {
        error.value = err.response?.data?.error || 'Registration failed'
      } finally {
        isLoading.value = false
      }
    }
    
    const toggleMode = () => {
      isRegisterMode.value = !isRegisterMode.value
      error.value = ''
    }
    
    return {
      form,
      registerForm,
      isLoading,
      error,
      isRegisterMode,
      handleSubmit,
      handleRegister,
      toggleMode
    }
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #1a1a1a;
}

.login-form {
  background-color: #2d2d2d;
  padding: 2rem;
  border-radius: 8px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.3);
}

.login-form h2 {
  text-align: center;
  margin-bottom: 2rem;
  color: #4CAF50;
}

.register-form {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #555;
}

.register-form h3 {
  color: #4CAF50;
  margin-bottom: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #e0e0e0;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #555;
  border-radius: 4px;
  background-color: #1a1a1a;
  color: #e0e0e0;
  font-size: 1rem;
}

.form-group input:focus {
  outline: none;
  border-color: #4CAF50;
}

.btn-primary {
  width: 100%;
  padding: 0.75rem;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-primary:hover:not(:disabled) {
  background-color: #45a049;
}

.btn-primary:disabled {
  background-color: #666;
  cursor: not-allowed;
}

.register-link {
  text-align: center;
  margin-top: 1rem;
  color: #888;
}

.link-button {
  background: none;
  border: none;
  color: #4CAF50;
  cursor: pointer;
  text-decoration: underline;
}

.error-message {
  background-color: #f44336;
  color: white;
  padding: 0.75rem;
  border-radius: 4px;
  margin-top: 1rem;
  text-align: center;
}
</style>