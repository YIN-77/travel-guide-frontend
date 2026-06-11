<template>
  <header class="search-header">
    <div class="search-bar">
      <div class="search-input-wrapper">
        <span class="search-icon">🔍</span>
        <input
          type="text"
          class="search-input"
          placeholder="搜索目的地、位置..."
          :value="searchQuery"
          @input="$emit('update:searchQuery', $event.target.value)"
          @keyup.enter="$emit('search')"
        >
      </div>

      <!-- 类型筛选下拉框 -->
      <div class="custom-select" ref="filterRef">
        <div class="select-trigger" @click="toggleFilterDropdown">
          <span>{{ getFilterLabel }}</span>
          <span class="arrow" :class="{ open: showFilterDropdown }">▼</span>
        </div>
        <div class="select-dropdown" v-show="showFilterDropdown">
          <div class="options-grid">
            <div
              v-for="option in filterOptions"
              :key="option.value"
              class="option-item"
              :class="{ selected: selectedFilter === option.value }"
              @click="selectFilter(option.value)"
            >
              {{ option.label }}
            </div>
          </div>
        </div>
      </div>

      <!-- 国家筛选下拉框 -->
      <div class="custom-select" ref="countryRef">
        <div class="select-trigger" @click="toggleCountryDropdown">
          <span>{{ getCountryLabel }}</span>
          <span class="arrow" :class="{ open: showCountryDropdown }">▼</span>
        </div>
        <div class="select-dropdown" v-show="showCountryDropdown">
          <div class="options-grid">
            <div
              v-for="option in countryOptions"
              :key="option.value"
              class="option-item"
              :class="{ selected: selectedCountry === option.value }"
              @click="selectCountry(option.value)"
            >
              {{ option.label }}
            </div>
          </div>
        </div>
      </div>

      <!-- 排序下拉框 -->
      <div class="custom-select" ref="sortRef">
        <div class="select-trigger" @click="toggleSortDropdown">
          <span>{{ getSortLabel }}</span>
          <span class="arrow" :class="{ open: showSortDropdown }">▼</span>
        </div>
        <div class="select-dropdown small" v-show="showSortDropdown">
          <div class="options-grid">
            <div
              v-for="option in sortOptions"
              :key="option.value"
              class="option-item"
              :class="{ selected: sortBy === option.value }"
              @click="selectSort(option.value)"
            >
              {{ option.label }}
            </div>
          </div>
        </div>
      </div>

      <button class="search-button" @click="$emit('search')">
        搜索
      </button>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  searchQuery: {
    type: String,
    default: ''
  },
  selectedFilter: {
    type: String,
    default: ''
  },
  selectedCountry: {
    type: String,
    default: ''
  },
  sortBy: {
    type: String,
    default: 'rating-desc'
  },
  filterOptions: {
    type: Array,
    required: true
  },
  countryOptions: {
    type: Array,
    required: true
  },
  sortOptions: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['update:searchQuery', 'update:selectedFilter', 'update:selectedCountry', 'update:sortBy', 'search'])

// 下拉框状态
const showFilterDropdown = ref(false)
const showCountryDropdown = ref(false)
const showSortDropdown = ref(false)

// refs
const filterRef = ref(null)
const countryRef = ref(null)
const sortRef = ref(null)

// 获取当前选中项的标签
const getFilterLabel = computed(() => {
  const option = props.filterOptions.find(o => o.value === props.selectedFilter)
  return option ? option.label : '全部类型'
})

const getCountryLabel = computed(() => {
  const option = props.countryOptions.find(o => o.value === props.selectedCountry)
  return option ? option.label : '全部国家'
})

const getSortLabel = computed(() => {
  const option = props.sortOptions.find(o => o.value === props.sortBy)
  return option ? option.label : '评分排序'
})

// 切换下拉框
const toggleFilterDropdown = () => {
  showFilterDropdown.value = !showFilterDropdown.value
  showCountryDropdown.value = false
  showSortDropdown.value = false
}

const toggleCountryDropdown = () => {
  showCountryDropdown.value = !showCountryDropdown.value
  showFilterDropdown.value = false
  showSortDropdown.value = false
}

const toggleSortDropdown = () => {
  showSortDropdown.value = !showSortDropdown.value
  showFilterDropdown.value = false
  showCountryDropdown.value = false
}

// 选择选项
const selectFilter = (value) => {
  emit('update:selectedFilter', value)
  showFilterDropdown.value = false
}

const selectCountry = (value) => {
  emit('update:selectedCountry', value)
  showCountryDropdown.value = false
}

const selectSort = (value) => {
  emit('update:sortBy', value)
  showSortDropdown.value = false
}

// 点击外部关闭下拉框
const handleClickOutside = (event) => {
  if (filterRef.value && !filterRef.value.contains(event.target)) {
    showFilterDropdown.value = false
  }
  if (countryRef.value && !countryRef.value.contains(event.target)) {
    showCountryDropdown.value = false
  }
  if (sortRef.value && !sortRef.value.contains(event.target)) {
    showSortDropdown.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.search-header {
  background: white;
  padding: 20px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.search-bar {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.search-input-wrapper {
  flex: 1;
  position: relative;
}

.search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 18px;
}

.search-input {
  width: 100%;
  padding: 14px 14px 14px 48px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 15px;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.search-input:focus {
  outline: none;
  border-color: #333;
  box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.1);
}

.search-input::placeholder {
  color: #a0aec0;
}

/* 自定义下拉框 */
.custom-select {
  position: relative;
  min-width: 140px;
}

.select-trigger {
  padding: 14px 20px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 15px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.select-trigger:hover {
  border-color: #cbd5e0;
}

.arrow {
  font-size: 10px;
  transition: transform 0.3s ease;
}

.arrow.open {
  transform: rotate(180deg);
}

.select-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
  z-index: 100;
  min-width: 400px;
  max-height: 200px;
  overflow-y: auto;
}

.select-dropdown.small {
  min-width: 280px;
  max-height: 150px;
}

/* 滚动条样式 */
.select-dropdown::-webkit-scrollbar {
  width: 8px;
}

.select-dropdown::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.select-dropdown::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 4px;
}

.select-dropdown::-webkit-scrollbar-thumb:hover {
  background: #999;
}

/* 选项网格 - 5列布局 */
.options-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
  padding: 12px;
}

.select-dropdown.small .options-grid {
  grid-template-columns: repeat(2, 1fr);
}

.option-item {
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
  background: #f8f9fa;
}

.option-item:hover {
  background: #e9ecef;
}

.option-item.selected {
  background: #333;
  color: white;
}

.search-button {
  padding: 14px 28px;
  background: #111;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.search-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

/* 移动端适配 */
@media (max-width: 768px) {
  .search-header {
    padding: 15px;
    border-radius: 12px;
  }

  .search-bar {
    flex-direction: column;
    gap: 10px;
  }

  .search-input-wrapper {
    width: 100%;
  }

  .search-input {
    padding: 12px 12px 12px 44px;
    font-size: 14px;
  }

  .custom-select {
    width: 100%;
  }

  .select-trigger {
    padding: 12px 16px;
    font-size: 14px;
  }

  .select-dropdown {
    position: fixed;
    left: 15px;
    right: 15px;
    min-width: auto;
    max-width: calc(100vw - 30px);
  }

  .options-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .search-button {
    width: 100%;
    padding: 12px;
    font-size: 14px;
  }
}
</style>