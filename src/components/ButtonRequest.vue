<template>
  <button
    :disabled="disabled || loading"
    :class="['px-5 py-2 w-50 text-white rounded-md text-xm font-medium', disabled || loading ? 
    'bg-gray-400 cursor-not-allowed' : 'bg-base hover:bg-azul']"
    @click="enviarSolicitud">{{ loading ? 'Enviando...' : label }}
    <i class="fas fa-edit ml-2"></i>
  </button>
</template>

<script lang="ts" setup>

const props = defineProps({
  label: {
    type: String,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['click']);

const enviarSolicitud = () => {
  if (!props.disabled && !props.loading) {
    emit('click');
  }
}
</script>