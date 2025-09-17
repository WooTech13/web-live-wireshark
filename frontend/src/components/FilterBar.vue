<template>
  <div class="filter-bar">
    <label for="filter-input">Filter:</label>
    <input
      id="filter-input"
      v-model="localFilter"
      @input="handleFilterInput"
      type="text"
      placeholder="e.g., tcp port 80, icmp, host 192.168.1.1"
      class="filter-input"
    />
    
    <div class="filter-presets">
      <button 
        v-for="preset in filterPresets" 
        :key="preset.name"
        @click="applyPreset(preset.filter)"
        class="btn-preset"
        :title="preset.description"
      >
        {{ preset.name }}
      </button>
    </div>
    
    <button @click="clearFilter" class="btn-clear" title="Clear filter">
      ❌
    </button>
  </div>
</template>

<script>
import { ref, watch } from 'vue'

export default {
  name: 'FilterBar',
  props: {
    filter: {
      type: String,
      default: ''
    }
  },
  emits: ['filter-changed'],
  setup(props, { emit }) {
    const localFilter = ref(props.filter)
    
    const filterPresets = [
      { name: 'HTTP', filter: 'tcp port 80 or tcp port 443', description: 'HTTP/HTTPS traffic' },
      { name: 'DNS', filter: 'udp port 53', description: 'DNS queries' },
      { name: 'SSH', filter: 'tcp port 22', description: 'SSH connections' },
      { name: 'ICMP', filter: 'icmp', description: 'ICMP packets (ping)' },
      { name: 'TCP', filter: 'tcp', description: 'All TCP traffic' },
      { name: 'UDP', filter: 'udp', description: 'All UDP traffic' }
    ]
    
    const handleFilterInput = () => {
      emit('filter-changed', localFilter.value)
    }
    
    const applyPreset = (filter) => {
      localFilter.value = filter
      emit('filter-changed', filter)
    }
    
    const clearFilter = () => {
      localFilter.value = ''
      emit('filter-changed', '')
    }
    
    // Watch for external filter changes
    watch(() => props.filter, (newFilter) => {
      localFilter.value = newFilter
    })
    
    return {
      localFilter,
      filterPresets,
      handleFilterInput,
      applyPreset,
      clearFilter
    }
  }
}
</script>

<style scoped>
.filter-bar {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.filter-bar label {
  color: #e0e0e0;
  font-weight: bold;
  white-space: nowrap;
}

.filter-input {
  padding: 0.5rem;
  border: 1px solid #555;
  border-radius: 4px;
  background-color: #1a1a1a;
  color: #e0e0e0;
  min-width: 400px;
  font-family: monospace;
}

.filter-input:focus {
  outline: none;
  border-color: #4CAF50;
}

.filter-presets {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.btn-preset {
  background-color: #555;
  color: white;
  border: none;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
}

.btn-preset:hover {
  background-color: #666;
}

.btn-clear {
  background-color: #f44336;
  color: white;
  border: none;
  padding: 0.5rem;
  border-radius: 4px;
  cursor: pointer;
}

.btn-clear:hover {
  background-color: #d32f2f;
}
</style>