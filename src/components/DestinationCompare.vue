<template>
  <div class="compare-wrapper">
    <!-- 底部浮动条 -->
    <transition name="slide-up">
      <div v-if="compareList.length > 0" class="compare-bar">
        <div class="compare-bar-content">
          <div class="compare-bar-left">
            <span class="compare-count">已选 <strong>{{ compareList.length }}</strong> 个景点</span>
            <span class="compare-hint" v-if="compareList.length < 2">（至少选择2个景点进行对比）</span>
          </div>
          <div class="compare-bar-right">
            <button class="compare-clear-btn" @click="$emit('clear')">清空</button>
            <button
              class="compare-go-btn"
              :disabled="compareList.length < 2"
              @click="showModal = true"
            >
              对比
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- 对比模态框 -->
    <transition name="fade">
      <div v-if="showModal" class="compare-modal-overlay" @click.self="showModal = false">
        <div class="compare-modal">
          <div class="compare-modal-header">
            <h2 class="compare-modal-title">景点对比</h2>
            <button class="compare-modal-close" @click="showModal = false">✕</button>
          </div>
          <div class="compare-modal-body">
            <div class="compare-table-wrapper">
              <table class="compare-table">
                <thead>
                  <tr>
                    <th class="attr-header">属性</th>
                    <th v-for="dest in compareList" :key="dest.id" class="dest-header">
                      <button class="remove-dest-btn" @click="$emit('remove', dest.id)" title="移除此景点">✕</button>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td class="attr-label">图片</td>
                    <td v-for="dest in compareList" :key="dest.id" class="dest-cell">
                      <img :src="processImage(dest.image)" :alt="dest.name" class="compare-thumb" />
                    </td>
                  </tr>
                  <tr>
                    <td class="attr-label">名称</td>
                    <td v-for="dest in compareList" :key="dest.id" class="dest-cell name-cell">
                      {{ dest.name }}
                    </td>
                  </tr>
                  <tr>
                    <td class="attr-label">评分</td>
                    <td v-for="dest in compareList" :key="dest.id" class="dest-cell">
                      ⭐ {{ dest.rating }}
                    </td>
                  </tr>
                  <tr>
                    <td class="attr-label">位置</td>
                    <td v-for="dest in compareList" :key="dest.id" class="dest-cell">
                      📍 {{ dest.location }}
                    </td>
                  </tr>
                  <tr>
                    <td class="attr-label">票价</td>
                    <td v-for="dest in compareList" :key="dest.id" class="dest-cell">
                      {{ dest.ticketPrice || '-' }}
                    </td>
                  </tr>
                  <tr>
                    <td class="attr-label">最佳游览时间</td>
                    <td v-for="dest in compareList" :key="dest.id" class="dest-cell">
                      {{ dest.bestTime || '-' }}
                    </td>
                  </tr>
                  <tr>
                    <td class="attr-label">建议游览时长</td>
                    <td v-for="dest in compareList" :key="dest.id" class="dest-cell">
                      {{ dest.duration || '-' }}
                    </td>
                  </tr>
                  <tr>
                    <td class="attr-label">营业时间</td>
                    <td v-for="dest in compareList" :key="dest.id" class="dest-cell">
                      {{ dest.openingHours || '-' }}
                    </td>
                  </tr>
                  <tr>
                    <td class="attr-label">交通</td>
                    <td v-for="dest in compareList" :key="dest.id" class="dest-cell">
                      {{ dest.transport || '-' }}
                    </td>
                  </tr>
                  <tr>
                    <td class="attr-label">标签</td>
                    <td v-for="dest in compareList" :key="dest.id" class="dest-cell">
                      <span v-if="dest.Tags && dest.Tags.length > 0" class="compare-tags">
                        <span v-for="tag in dest.Tags" :key="tag.id" class="compare-tag">{{ tag.name }}</span>
                      </span>
                      <span v-else>-</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  compareList: {
    type: Array,
    default: () => []
  }
})

defineEmits(['remove', 'clear', 'compare'])

const showModal = ref(false)

const processImage = (url) => {
  if (!url) return 'https://via.placeholder.com/100x70?text=No+Image'
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url
  }
  return `http://localhost:3000${url.startsWith('/') ? '' : '/'}${url}`
}
</script>

<style scoped>
.compare-wrapper {
  position: relative;
  z-index: 99;
}

/* 底部浮动条 */
.compare-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1001;
  background: white;
  border-top: 1px solid #e5e5e5;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
  padding: 12px 20px;
}

.compare-bar-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.compare-bar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.compare-count {
  font-size: 15px;
  color: #333;
}

.compare-count strong {
  color: #111;
  font-size: 18px;
}

.compare-hint {
  font-size: 13px;
  color: #999;
}

.compare-bar-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.compare-clear-btn {
  padding: 8px 20px;
  background: #f5f5f5;
  color: #666;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.compare-clear-btn:hover {
  background: #eee;
  color: #333;
}

.compare-go-btn {
  padding: 8px 24px;
  background: #111;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.compare-go-btn:hover:not(:disabled) {
  background: #333;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.compare-go-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* 模态框 */
.compare-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.compare-modal {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 1000px;
  width: 100%;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.compare-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #eee;
  flex-shrink: 0;
}

.compare-modal-title {
  font-size: 20px;
  font-weight: 700;
  color: #111;
  margin: 0;
}

.compare-modal-close {
  width: 36px;
  height: 36px;
  border: none;
  background: #f0f0f0;
  border-radius: 50%;
  font-size: 16px;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.compare-modal-close:hover {
  background: #111;
  color: white;
}

.compare-modal-body {
  flex: 1;
  overflow: auto;
  padding: 20px 24px;
}

/* 对比表格 */
.compare-table-wrapper {
  overflow-x: auto;
}

.compare-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 600px;
}

.compare-table thead th {
  position: sticky;
  top: 0;
  background: white;
  z-index: 1;
}

.attr-header {
  width: 140px;
  padding: 12px 16px;
  text-align: left;
  font-size: 14px;
  font-weight: 600;
  color: #111;
  border-bottom: 2px solid #eee;
  background: #fafafa;
  position: sticky;
  left: 0;
  z-index: 2;
}

.dest-header {
  padding: 12px 16px;
  text-align: center;
  border-bottom: 2px solid #eee;
  min-width: 150px;
}

.remove-dest-btn {
  width: 28px;
  height: 28px;
  border: none;
  background: #f0f0f0;
  border-radius: 50%;
  font-size: 12px;
  color: #999;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  transition: all 0.3s ease;
}

.remove-dest-btn:hover {
  background: #ff4444;
  color: white;
}

.attr-label {
  padding: 14px 16px;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  border-bottom: 1px solid #f0f0f0;
  background: #fafafa;
  white-space: nowrap;
  position: sticky;
  left: 0;
  z-index: 1;
}

.dest-cell {
  padding: 14px 16px;
  text-align: center;
  font-size: 14px;
  color: #555;
  border-bottom: 1px solid #f0f0f0;
  vertical-align: middle;
}

.name-cell {
  font-weight: 700;
  color: #111;
  font-size: 15px;
}

.compare-thumb {
  width: 100px;
  height: 70px;
  object-fit: cover;
  border-radius: 8px;
}

.compare-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  justify-content: center;
}

.compare-tag {
  background: #eee;
  color: #555;
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 12px;
}

/* 过渡动画 */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .compare-bar {
    padding: 10px 12px;
  }

  .compare-bar-content {
    flex-direction: column;
    gap: 10px;
  }

  .compare-bar-left {
    width: 100%;
    justify-content: center;
  }

  .compare-bar-right {
    width: 100%;
    justify-content: center;
  }

  .compare-count {
    font-size: 14px;
  }

  .compare-count strong {
    font-size: 16px;
  }

  .compare-hint {
    display: none;
  }

  .compare-modal-overlay {
    padding: 0;
    align-items: flex-end;
  }

  .compare-modal {
    max-width: 100%;
    width: 100%;
    max-height: 90vh;
    border-radius: 16px 16px 0 0;
  }

  .compare-modal-header {
    padding: 16px 20px;
  }

  .compare-modal-title {
    font-size: 18px;
  }

  .compare-modal-body {
    padding: 12px 16px;
  }

  .attr-header {
    width: 100px;
    padding: 10px 12px;
    font-size: 12px;
  }

  .attr-label {
    padding: 10px 12px;
    font-size: 12px;
  }

  .dest-cell {
    padding: 10px 12px;
    font-size: 12px;
    min-width: 120px;
  }

  .name-cell {
    font-size: 13px;
  }

  .compare-thumb {
    width: 80px;
    height: 56px;
  }
}
</style>
