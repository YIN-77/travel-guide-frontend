import { ref } from 'vue'

// 全局共享的景点数据，避免 Home.vue 和 Navbar.vue 重复请求
const destinations = ref([])
const loaded = ref(false)

export function useSharedDestinations() {
  const setDestinations = (data) => {
    destinations.value = data
    loaded.value = true
  }

  return {
    destinations,
    loaded,
    setDestinations
  }
}
