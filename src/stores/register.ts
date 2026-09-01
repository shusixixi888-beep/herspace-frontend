import { defineStore } from 'pinia'
import { ref } from 'vue'

/**
 * 注册流程状态管理
 * 管理注册流程的Token和当前步骤
 */
export const useRegisterStore = defineStore('register', () => {
  const token = ref(localStorage.getItem('registerToken') || '')
  const currentStep = ref(localStorage.getItem('registerStep') || 'phone')

  function setToken(tokenVal: string, step: string) {
    token.value = tokenVal
    currentStep.value = step
    localStorage.setItem('registerToken', tokenVal)
    localStorage.setItem('registerStep', step)
  }

  function clear() {
    token.value = ''
    currentStep.value = 'phone'
    localStorage.removeItem('registerToken')
    localStorage.removeItem('registerStep')
  }

  return {
    token,
    currentStep,
    setToken,
    clear,
  }
})