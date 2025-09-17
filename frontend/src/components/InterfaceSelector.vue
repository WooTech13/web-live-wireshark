<template>
  <div class="interface-selector">
    <label for="interface-select">Network Interface:</label>
    <select 
      id="interface-select"
      :value="selectedInterface?.id || ''"
      @change="handleInterfaceChange"
      class="interface-select"
    >
      <option value="">Select an interface...</option>
      <option 
        v-for="iface in interfaces" 
        :key="iface.id"
        :value="iface.id"
      >
        {{ iface.name }} ({{ iface.description }})
      </option>
    </select>
    
    <button @click="refreshInterfaces" class="btn-refresh" title="Refresh interfaces">
      🔄
    </button>
  </div>
</template>

<script>
export default {
  name: 'InterfaceSelector',
  props: {
    interfaces: {
      type: Array,
      default: () => []
    },
    selectedInterface: {
      type: Object,
      default: null
    }
  },
  emits: ['interface-selected', 'refresh-interfaces'],
  setup(props, { emit }) {
    const handleInterfaceChange = (event) => {
      const selectedId = event.target.value
      const selectedInterface = props.interfaces.find(iface => iface.id === selectedId)
      emit('interface-selected', selectedInterface)
    }
    
    const refreshInterfaces = () => {
      emit('refresh-interfaces')
    }
    
    return {
      handleInterfaceChange,
      refreshInterfaces
    }
  }
}
</script>

<style scoped>
.interface-selector {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.interface-selector label {
  color: #e0e0e0;
  font-weight: bold;
  white-space: nowrap;
}

.interface-select {
  padding: 0.5rem;
  border: 1px solid #555;
  border-radius: 4px;
  background-color: #1a1a1a;
  color: #e0e0e0;
  min-width: 300px;
}

.interface-select:focus {
  outline: none;
  border-color: #4CAF50;
}

.btn-refresh {
  background-color: #2196F3;
  color: white;
  border: none;
  padding: 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.btn-refresh:hover {
  background-color: #1976D2;
}
</style>