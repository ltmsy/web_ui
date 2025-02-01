<template>
  <div class="custom-select" v-click-outside="closeDropdown">
    <div class="select-trigger" @click="isOpen = !isOpen">
      <template v-if="modelValue">
        <div 
          class="identity-icon" 
          :style="{ backgroundImage: `url(${modelValue.levelIcon})` }"
        ></div>
        <span>{{ modelValue.identityName }}</span>
      </template>
      <template v-else>
        <span>使用真实身份</span>
      </template>
      <span class="arrow" :class="{ open: isOpen }">▼</span>
    </div>
    
    <div class="options" v-if="isOpen">
      <div 
        class="option"
        @click="selectOption(null)"
        :class="{ selected: !modelValue }"
      >
        使用真实身份
      </div>
      <div 
        v-for="option in options" 
        :key="option.id"
        class="option"
        :class="{ selected: modelValue?.id === option.id }"
        @click="selectOption(option)"
      >
        <div 
          class="identity-icon" 
          :style="{ backgroundImage: `url(${option.levelIcon})` }"
        ></div>
        <span>{{ option.identityName }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  modelValue: Object,
  options: Array
});

const emit = defineEmits(['update:modelValue']);

const isOpen = ref(false);

const selectOption = (option) => {
  emit('update:modelValue', option);
  isOpen.value = false;
};

const closeDropdown = () => {
  isOpen.value = false;
};
</script>

<style scoped>
.custom-select {
  position: relative;
  width: 200px;
}

.select-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: var(--bg-darker);
  border: 1px solid var(--border-dark);
  border-radius: 4px;
  cursor: pointer;
  color: var(--text-primary);
}

.arrow {
  margin-left: auto;
  transition: transform 0.2s;
}

.arrow.open {
  transform: rotate(180deg);
}

.options {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--bg-darker);
  border: 1px solid var(--border-dark);
  border-radius: 4px;
  margin-top: 4px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
}

.option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.option:hover {
  background: var(--bg-hover);
}

.option.selected {
  background: var(--bg-lighter);
}

.identity-icon {
  width: 35px;
  height: 14px;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}
</style> 