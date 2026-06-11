<template>
  <div class="map-container">
    <div v-if="latitude && longitude" class="map-wrapper">
      <div class="map-canvas">
        <div class="map-grid"></div>
        <div class="map-lines horizontal"></div>
        <div class="map-lines vertical"></div>
        <div 
          class="location-marker"
          :style="{ left: markerX + '%', top: markerY + '%' }"
        >
          <span class="marker-icon">📍</span>
        </div>
        <div class="map-scale">
          <span>⬆️ 北</span>
        </div>
      </div>
      <div class="map-info-panel">
        <div class="info-header">
          <span class="info-icon">🗺️</span>
          <span class="info-title">{{ title }}</span>
        </div>
        <div class="info-content">
          <div class="info-row">
            <span class="info-label">纬度</span>
            <span class="info-value">{{ latitude }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">经度</span>
            <span class="info-value">{{ longitude }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">位置</span>
            <span class="info-value">{{ hemisphere }}</span>
          </div>
        </div>
        <div class="info-actions">
          <button class="nav-btn" @click="openGoogleMaps">📍 打开Google地图</button>
          <button class="nav-btn" @click="openBaiduMaps">📍 打开百度地图</button>
        </div>
      </div>
    </div>
    <div v-else class="no-map">
      <span class="no-map-icon">🗺️</span>
      <p>暂无位置信息</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  latitude: {
    type: [String, Number],
    default: ''
  },
  longitude: {
    type: [String, Number],
    default: ''
  },
  title: {
    type: String,
    default: '景点位置'
  },
  zoom: {
    type: Number,
    default: 15
  }
})

const lat = computed(() => parseFloat(props.latitude))
const lng = computed(() => parseFloat(props.longitude))

const markerX = computed(() => {
  if (isNaN(lng.value)) return 50
  return ((lng.value + 180) / 360) * 100
})

const markerY = computed(() => {
  if (isNaN(lat.value)) return 50
  return ((90 - lat.value) / 180) * 100
})

const hemisphere = computed(() => {
  if (isNaN(lat.value) || isNaN(lng.value)) return ''
  const ns = lat.value >= 0 ? '北半球' : '南半球'
  const ew = lng.value >= 0 ? '东半球' : '西半球'
  return `${ns} · ${ew}`
})

const openGoogleMaps = () => {
  window.open(`https://www.google.com/maps/place/${lat.value},${lng.value}`, '_blank')
}

const openBaiduMaps = () => {
  window.open(`https://map.baidu.com/search/${lat.value},${lng.value}`, '_blank')
}
</script>

<style scoped>
.map-container {
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  background: #f5f5f5;
}

.map-wrapper {
  display: flex;
  gap: 20px;
}

.map-canvas {
  flex: 1;
  height: 350px;
  position: relative;
  background: linear-gradient(135deg, #e8f4f8 0%, #d0e6f0 100%);
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid #2c3e50;
}

.map-grid {
  position: absolute;
  width: 100%;
  height: 100%;
  background-image: 
    linear-gradient(rgba(44, 62, 80, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(44, 62, 80, 0.1) 1px, transparent 1px);
  background-size: 30px 30px;
}

.map-lines {
  position: absolute;
  width: 100%;
  height: 100%;
}

.map-lines.horizontal::before,
.map-lines.horizontal::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  height: 1px;
  background: rgba(44, 62, 80, 0.3);
}

.map-lines.horizontal::before {
  top: 33.33%;
}

.map-lines.horizontal::after {
  top: 66.66%;
}

.map-lines.vertical::before,
.map-lines.vertical::after {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  width: 1px;
  background: rgba(44, 62, 80, 0.3);
}

.map-lines.vertical::before {
  left: 33.33%;
}

.map-lines.vertical::after {
  left: 66.66%;
}

.location-marker {
  position: absolute;
  transform: translate(-50%, -50%);
  z-index: 10;
}

.marker-icon {
  font-size: 36px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
}

.map-scale {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(255, 255, 255, 0.9);
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.map-info-panel {
  width: 220px;
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.info-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #eee;
}

.info-icon {
  font-size: 20px;
}

.info-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.info-content {
  flex: 1;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 13px;
  color: #666;
}

.info-value {
  font-size: 13px;
  font-weight: 500;
  color: #333;
  min-width: 100px;
  text-align: right;
}

.info-actions {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nav-btn {
  width: 100%;
  padding: 10px 12px;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.nav-btn:nth-child(1) {
  background: #4285f4;
  color: white;
}

.nav-btn:nth-child(1):hover {
  background: #3367d6;
}

.nav-btn:nth-child(2) {
  background: #3385ff;
  color: white;
}

.nav-btn:nth-child(2):hover {
  background: #2d78f4;
}

.no-map {
  height: 350px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #999;
}

.no-map-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.no-map p {
  margin: 0;
  font-size: 16px;
}

@media (max-width: 768px) {
  .map-wrapper {
    flex-direction: column;
  }
  
  .map-info-panel {
    width: 100%;
  }
}
</style>
