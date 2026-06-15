<template>
  <div class="big-screen">
    <!-- 顶部标题栏 -->
    <header class="screen-header">
      <div class="header-left">
        <div class="deco-line"></div>
        <span class="header-subtitle">DATA VISUALIZATION</span>
      </div>
      <h1 class="screen-title">旅游指南共享平台 · 数据大屏</h1>
      <div class="header-right">
        <span class="login-status" :class="{ 'logged-in': isLoggedIn }">
          {{ isLoggedIn ? '● 已登录' : '○ 未登录' }}
        </span>
        <span class="current-time">{{ currentTime }}</span>
        <div class="deco-line"></div>
      </div>
    </header>

    <!-- 未登录提示 -->
    <div v-if="!isLoggedIn" class="login-tip">
      <span>⚠️ 部分统计数据需要管理员登录才能获取，当前显示为模拟数据。</span>
      <a href="/admin/login" target="_blank">点击登录</a>
    </div>

    <!-- 顶部统计指标 -->
    <div class="metrics-row">
      <div class="metric-card" v-for="(m, idx) in metrics" :key="idx">
        <div class="metric-icon" :class="'icon-' + idx">
          <span>{{ m.icon }}</span>
        </div>
        <div class="metric-info">
          <div class="metric-value">{{ m.value }}</div>
          <div class="metric-label">{{ m.label }}</div>
        </div>
      </div>
    </div>

    <!-- 主内容区域：三列布局 -->
    <div class="content-area">
      <!-- 左列 -->
      <div class="col col-left">
        <!-- 景点评分分布 -->
        <div class="panel">
          <div class="panel-title">
            <span class="panel-icon"></span>
            <span>景点评分分布</span>
          </div>
          <div class="panel-body">
            <div ref="ratingChartRef" class="chart-container"></div>
          </div>
        </div>
        <!-- 标签分布 -->
        <div class="panel">
          <div class="panel-title">
            <span class="panel-icon"></span>
            <span>热门标签 TOP</span>
          </div>
          <div class="panel-body">
            <div ref="tagChartRef" class="chart-container"></div>
          </div>
        </div>
      </div>

      <!-- 中列 -->
      <div class="col col-center">
        <!-- 热门景点排行 -->
        <div class="panel">
          <div class="panel-title">
            <span class="panel-icon"></span>
            <span>热门景点排行榜</span>
          </div>
          <div class="panel-body">
            <div ref="rankChartRef" class="chart-container"></div>
          </div>
        </div>
        <!-- 内容类型分布 -->
        <div class="panel">
          <div class="panel-title">
            <span class="panel-icon"></span>
            <span>内容类型分布</span>
          </div>
          <div class="panel-body">
            <div ref="typeChartRef" class="chart-container"></div>
          </div>
        </div>
      </div>

      <!-- 右列 -->
      <div class="col col-right">
        <!-- 最新评论 -->
        <div class="panel">
          <div class="panel-title">
            <span class="panel-icon"></span>
            <span>最新评论动态</span>
          </div>
          <div class="panel-body">
            <div class="review-list">
              <div
                class="review-item"
                v-for="(r, idx) in recentReviews"
                :key="idx"
              >
                <div class="review-avatar">{{ (r.user_name || 'U').charAt(0) }}</div>
                <div class="review-content">
                  <div class="review-user">
                    <span class="user-name">{{ r.user_name || '匿名用户' }}</span>
                    <span class="review-dest">评论了 《{{ r.Destination?.name || '景点' }}》</span>
                  </div>
                  <div class="review-text">{{ r.content }}</div>
                </div>
                <div class="review-rating">
                  <span class="rating-score">{{ r.rating || 5 }}</span>
                  <span class="rating-star">★</span>
                </div>
              </div>
              <div v-if="recentReviews.length === 0" class="empty-tip">暂无评论数据</div>
            </div>
          </div>
        </div>
        <!-- 最新景点 -->
        <div class="panel">
          <div class="panel-title">
            <span class="panel-icon"></span>
            <span>最新收录景点</span>
          </div>
          <div class="panel-body">
            <div class="dest-list">
              <div
                class="dest-item"
                v-for="(d, idx) in recentDestinations"
                :key="idx"
              >
                <div class="dest-index">{{ String(idx + 1).padStart(2, '0') }}</div>
                <div class="dest-info">
                  <div class="dest-name">{{ d.name }}</div>
                  <div class="dest-location">{{ d.location || '未知地点' }}</div>
                </div>
                <div class="dest-rating">
                  <span class="dest-score">{{ d.rating || 0 }}</span>
                  <span class="dest-star">★</span>
                </div>
              </div>
              <div v-if="recentDestinations.length === 0" class="empty-tip">暂无景点数据</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部装饰 -->
    <div class="screen-footer">
      <div class="footer-info">
        <span>● 系统运行中</span>
        <span>数据更新时间：{{ currentTime }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import { destinationAPI } from '../api/destinations'

// 登录状态检查（从 localStorage 读取）
const isLoggedIn = ref(false)
const checkLoginStatus = () => {
  const token = localStorage.getItem('token')
  const admin = localStorage.getItem('admin')
  isLoggedIn.value = !!token && !!admin
}

// 时间显示
const currentTime = ref('')
const updateTime = () => {
  const now = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  currentTime.value = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
}
let timeTimer = setInterval(updateTime, 1000)
updateTime()

// 统计指标
const metrics = ref([
  { label: '景点总数', value: 0, icon: '◆' },
  { label: '评论总数', value: 0, icon: '◇' },
  { label: '标签总数', value: 0, icon: '▲' },
  { label: '管理员数', value: 0, icon: '●' }
])

// 数据列表
const recentReviews = ref([])
const recentDestinations = ref([])

// 图表ref
const ratingChartRef = ref(null)
const tagChartRef = ref(null)
const rankChartRef = ref(null)
const typeChartRef = ref(null)

// 图表实例
let ratingChart = null
let tagChart = null
let rankChart = null
let typeChart = null

// 数字滚动动画
const animateNumber = (target, endValue, duration = 1500) => {
  const startTime = performance.now()
  const startValue = 0
  const animate = (currentTime) => {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    const easeOut = 1 - Math.pow(1 - progress, 3)
    target.value = Math.floor(startValue + (endValue - startValue) * easeOut)
    if (progress < 1) {
      requestAnimationFrame(animate)
    }
  }
  requestAnimationFrame(animate)
}

// 加载统计数据（尝试使用管理员登录状态）
const loadStats = async () => {
  try {
    // 先从公开接口获取景点数据
    const destRes = await destinationAPI.getList({ page: 1, pageSize: 100 })
    const destList = (destRes.data?.items || destRes.data?.list || destRes.data || destRes || [])
    const total = destRes.data?.total || destList.length

    // 景点总数
    metrics.value[0].value = total

    // 标签总数（从景点中提取）
    const tagSet = new Set()
    destList.forEach(d => {
      if (d.Tags) {
        // Tags 可能是字符串或数组
        if (Array.isArray(d.Tags)) {
          d.Tags.forEach(t => {
            const name = typeof t === 'object' ? t.name : t
            tagSet.add(name)
          })
        } else if (typeof d.Tags === 'string' && d.Tags.trim()) {
          // 如果是字符串，尝试解析为JSON数组
          try {
            const tags = JSON.parse(d.Tags)
            if (Array.isArray(tags)) {
              tags.forEach(t => {
                const name = typeof t === 'object' ? t.name : t
                tagSet.add(name)
              })
            }
          } catch (e) {
            // 如果不是JSON，当作单个标签
            tagSet.add(d.Tags.trim())
          }
        }
      }
    })
    metrics.value[2].value = tagSet.size

    // 最新景点列表（按ID倒序）
    recentDestinations.value = [...destList]
      .sort((a, b) => (b.id || 0) - (a.id || 0))
      .slice(0, 6)
      .map(d => ({
        name: d.name,
        location: d.location,
        rating: parseFloat(d.rating) || 0
      }))

    // 检查是否有管理员登录token
    const adminToken = localStorage.getItem('token')
    const adminData = localStorage.getItem('admin')
    if (adminToken && adminData) {
      // 有登录token，尝试获取统计数据
      try {
        console.log('BigScreen: 尝试获取统计数据，token存在')
        
        // 使用绝对路径请求API
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
        const statsRes = await fetch(`${baseUrl}/stats/dashboard`, {
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        })
        
        console.log('BigScreen: 统计接口响应状态:', statsRes.status)
        
        // 检查响应内容类型
        const contentType = statsRes.headers.get('content-type')
        if (!contentType || !contentType.includes('application/json')) {
          console.log('BigScreen: 响应不是JSON，可能被重定向')
          // 清除无效token
          localStorage.removeItem('token')
          localStorage.removeItem('admin')
          isLoggedIn.value = false
        } else if (statsRes.ok) {
          const statsData = await statsRes.json()
          console.log('BigScreen: 统计数据:', statsData)
          
          if (statsData.data) {
            // 使用真实统计数据
            metrics.value[1].value = statsData.data.reviewCount || statsData.data.count?.reviews || 0
            metrics.value[3].value = statsData.data.adminCount || statsData.data.count?.admins || 0
            
            // 最新评论
            if (statsData.data.recentReviews && Array.isArray(statsData.data.recentReviews)) {
              recentReviews.value = statsData.data.recentReviews.slice(0, 6)
            } else if (statsData.data.reviews && Array.isArray(statsData.data.reviews)) {
              recentReviews.value = statsData.data.reviews.slice(0, 6)
            }
            
            // 如果有更新的景点列表
            if (statsData.data.recentDestinations && Array.isArray(statsData.data.recentDestinations)) {
              recentDestinations.value = statsData.data.recentDestinations.slice(0, 6).map(d => ({
                name: d.name,
                location: d.location,
                rating: parseFloat(d.rating) || 0
              }))
            }
            
            isLoggedIn.value = true
            console.log('BigScreen: 成功获取统计数据')
          } else {
            console.log('BigScreen: 统计数据为空')
          }
        } else if (statsRes.status === 401) {
          console.log('BigScreen: Token无效或已过期')
          localStorage.removeItem('token')
          localStorage.removeItem('admin')
          isLoggedIn.value = false
        } else {
          console.log('BigScreen: 统计接口返回错误:', statsRes.status)
        }
      } catch (statsErr) {
        console.error('BigScreen: 获取统计数据失败:', statsErr)
        // 继续使用公开数据
      }
    } else {
      console.log('BigScreen: 未登录，使用公开数据')
      metrics.value[1].value = 0
      metrics.value[3].value = 0
      isLoggedIn.value = false
    }
  } catch (err) {
    console.error('加载统计数据失败:', err)
    metrics.value = [
      { label: '景点总数', value: 0, icon: '◆' },
      { label: '评论总数', value: 0, icon: '◇' },
      { label: '标签总数', value: 0, icon: '▲' },
      { label: '管理员数', value: 0, icon: '●' }
    ]
    recentDestinations.value = []
    recentReviews.value = []
  }
}

// 加载景点列表（用于图表）
const loadDestinationsForCharts = async () => {
  try {
    const res = await destinationAPI.getList({ page: 1, pageSize: 50 })
    const destList = (res.data?.items || res.data || res || [])

    // 评分分布
    const ratingDist = { '5星': 0, '4星': 0, '3星': 0, '2星': 0, '1星': 0 }
    // 热门排行
    const rankData = []
    // 标签聚合
    const tagMap = {}

    destList.forEach((d, i) => {
      const rating = d.rating || 0
      if (rating >= 4.5) ratingDist['5星']++
      else if (rating >= 3.5) ratingDist['4星']++
      else if (rating >= 2.5) ratingDist['3星']++
      else if (rating >= 1.5) ratingDist['2星']++
      else ratingDist['1星']++

      if (i < 10) {
        rankData.push({ name: d.name, value: rating })
      }

      if (d.Tags) {
        if (Array.isArray(d.Tags)) {
          d.Tags.forEach((t) => {
            const name = typeof t === 'object' ? t.name : t
            tagMap[name] = (tagMap[name] || 0) + 1
          })
        } else if (typeof d.Tags === 'string' && d.Tags.trim()) {
          try {
            const tags = JSON.parse(d.Tags)
            if (Array.isArray(tags)) {
              tags.forEach((t) => {
                const name = typeof t === 'object' ? t.name : t
                tagMap[name] = (tagMap[name] || 0) + 1
              })
            }
          } catch (e) {
            const name = d.Tags.trim()
            tagMap[name] = (tagMap[name] || 0) + 1
          }
        }
      }
    })

    // 渲染评分图
    renderRatingChart(ratingDist)

    // 渲染标签图
    const tagList = Object.entries(tagMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8)
    renderTagChart(tagList)

    // 渲染排行图
    renderRankChart(rankData.slice(0, 8))

    // 渲染类型分布图（基于真实数据）
    renderTypeChart({
      destinations: destList.length,
      itineraries: 0,
      guides: 0,
      reviews: metrics.value[1].value || 0,
      news: 0
    })
  } catch (err) {
    console.error('加载景点数据失败:', err)
    // 不显示模拟数据，使用空数据
    renderRatingChart({ '5星': 0, '4星': 0, '3星': 0, '2星': 0, '1星': 0 })
    renderTagChart([])
    renderRankChart([])
    renderTypeChart({ destinations: 0, itineraries: 0, guides: 0, reviews: 0, news: 0 })
  }
}

// 评分分布图表 - 饼图
const renderRatingChart = (data) => {
  if (!ratingChartRef.value) return
  if (!ratingChart) ratingChart = echarts.init(ratingChartRef.value)

  const colors = ['#00d4ff', '#00ff87', '#ffd93d', '#ff6b6b', '#c44569']
  ratingChart.setOption({
    tooltip: { trigger: 'item', backgroundColor: 'rgba(0,20,40,0.9)', borderColor: '#00d4ff', textStyle: { color: '#fff' } },
    legend: { orient: 'vertical', right: 10, top: 'center', textStyle: { color: '#8ec5ff', fontSize: 12 } },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['35%', '50%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 4, borderColor: '#0a1929', borderWidth: 2 },
      label: { show: false },
      emphasis: { label: { show: true, fontSize: 14, fontWeight: 'bold', color: '#fff' } },
      data: Object.entries(data).map(([k, v], i) => ({ value: v, name: k, itemStyle: { color: colors[i] } }))
    }]
  })
}

// 标签分布 - 条形图
const renderTagChart = (data) => {
  if (!tagChartRef.value) return
  if (!tagChart) tagChart = echarts.init(tagChartRef.value)

  tagChart.setOption({
    tooltip: { trigger: 'axis', backgroundColor: 'rgba(0,20,40,0.9)', borderColor: '#00d4ff', textStyle: { color: '#fff' } },
    grid: { left: '3%', right: '8%', bottom: '3%', top: '5%', containLabel: true },
    xAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#1a3a5a' } },
      axisLabel: { color: '#8ec5ff' },
      splitLine: { lineStyle: { color: '#1a3a5a', type: 'dashed' } }
    },
    yAxis: {
      type: 'category',
      data: data.map((d) => d.name).reverse(),
      axisLine: { lineStyle: { color: '#1a3a5a' } },
      axisLabel: { color: '#8ec5ff', fontSize: 11 }
    },
    series: [{
      type: 'bar',
      data: data.map((d) => d.value).reverse(),
      barWidth: '55%',
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
          { offset: 0, color: '#00d4ff' }, { offset: 1, color: '#0066ff' }
        ]),
        borderRadius: [0, 4, 4, 0]
      },
      label: { show: true, position: 'right', color: '#8ec5ff', fontSize: 11 }
    }]
  })
}

// 热门排行 - 横向柱状图
const renderRankChart = (data) => {
  if (!rankChartRef.value) return
  if (!rankChart) rankChart = echarts.init(rankChartRef.value)

  const sortedData = [...data].sort((a, b) => a.value - b.value)
  rankChart.setOption({
    tooltip: { trigger: 'axis', backgroundColor: 'rgba(0,20,40,0.9)', borderColor: '#00d4ff', textStyle: { color: '#fff' } },
    grid: { left: '3%', right: '10%', bottom: '3%', top: '5%', containLabel: true },
    xAxis: {
      type: 'value',
      max: 5,
      axisLine: { lineStyle: { color: '#1a3a5a' } },
      axisLabel: { color: '#8ec5ff' },
      splitLine: { lineStyle: { color: '#1a3a5a', type: 'dashed' } }
    },
    yAxis: {
      type: 'category',
      data: sortedData.map((d) => d.name),
      axisLine: { lineStyle: { color: '#1a3a5a' } },
      axisLabel: { color: '#8ec5ff', fontSize: 12 }
    },
    series: [{
      type: 'bar',
      data: sortedData.map((d, i) => ({
        value: d.value,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: '#00ff87' }, { offset: 1, color: '#00d4ff' }
          ]),
          borderRadius: [0, 4, 4, 0]
        }
      })),
      barWidth: '55%',
      label: { show: true, position: 'right', color: '#00ff87', fontWeight: 'bold', fontSize: 12, formatter: '{c}★' }
    }]
  })
}

// 内容类型分布 - 玫瑰图
const renderTypeChart = (data) => {
  if (!typeChartRef.value) return
  if (!typeChart) typeChart = echarts.init(typeChartRef.value)

  const items = [
    { name: '景点', value: data.destinations },
    { name: '行程', value: data.itineraries },
    { name: '攻略', value: data.guides },
    { name: '评论', value: data.reviews },
    { name: '资讯', value: data.news }
  ]
  const colors = ['#00d4ff', '#00ff87', '#ffd93d', '#ff6b6b', '#c792ea']

  typeChart.setOption({
    tooltip: { trigger: 'item', backgroundColor: 'rgba(0,20,40,0.9)', borderColor: '#00d4ff', textStyle: { color: '#fff' } },
    legend: { bottom: 0, textStyle: { color: '#8ec5ff', fontSize: 11 } },
    series: [{
      type: 'pie',
      radius: [30, 100],
      center: ['50%', '45%'],
      roseType: 'area',
      itemStyle: { borderRadius: 6, borderColor: '#0a1929', borderWidth: 2 },
      label: { color: '#8ec5ff', fontSize: 11 },
      data: items.map((it, i) => ({ ...it, itemStyle: { color: colors[i] } }))
    }]
  })
}

// 响应窗口大小变化
const handleResize = () => {
  ratingChart && ratingChart.resize()
  tagChart && tagChart.resize()
  rankChart && rankChart.resize()
  typeChart && typeChart.resize()
}

let dataRefreshTimer = null

// 监听 storage 变化（跨窗口同步登录状态）
const handleStorageChange = (e) => {
  if (e.key === 'token' || e.key === 'admin') {
    checkLoginStatus()
    if (isLoggedIn.value) {
      loadStats()
    }
  }
}

onMounted(async () => {
  checkLoginStatus()
  await loadStats()
  await nextTick()
  await loadDestinationsForCharts()

  window.addEventListener('resize', handleResize)
  window.addEventListener('storage', handleStorageChange)

  // 每30秒刷新一次数据
  dataRefreshTimer = setInterval(async () => {
    updateTime()
    checkLoginStatus()
    await loadStats()
  }, 30000)
})

onUnmounted(() => {
  clearInterval(timeTimer)
  clearInterval(dataRefreshTimer)
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('storage', handleStorageChange)
  ratingChart && ratingChart.dispose()
  tagChart && tagChart.dispose()
  rankChart && rankChart.dispose()
  typeChart && typeChart.dispose()
})
</script>

<style scoped>
.big-screen {
  width: 100vw;
  height: 100vh;
  background: #0a1929;
  background-image:
    radial-gradient(ellipse at top, rgba(0, 100, 200, 0.15), transparent 60%),
    radial-gradient(ellipse at bottom, rgba(0, 200, 150, 0.1), transparent 60%);
  color: #fff;
  font-family: 'Microsoft YaHei', sans-serif;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding: 1vh 1.5vw;
  box-sizing: border-box;
}

/* 顶部标题栏 */
.screen-header {
  height: 7vh;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(0, 212, 255, 0.2);
  position: relative;
}

.screen-title {
  font-size: 2.2vw;
  margin: 0;
  color: #fff;
  font-weight: bold;
  letter-spacing: 4px;
  background: linear-gradient(180deg, #fff 30%, #00d4ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 20px rgba(0, 212, 255, 0.5);
}

.header-left, .header-right {
  display: flex;
  align-items: center;
  gap: 15px;
  flex: 1;
}

.header-right {
  justify-content: flex-end;
}

.header-subtitle {
  color: #00d4ff;
  font-size: 0.8vw;
  letter-spacing: 2px;
}

.deco-line {
  flex: 1;
  height: 2px;
  background: linear-gradient(90deg, transparent, #00d4ff, transparent);
  max-width: 150px;
}

.current-time {
  color: #8ec5ff;
  font-size: 1vw;
  font-family: 'Courier New', monospace;
}

.login-status {
  color: #ff6b6b;
  font-size: 0.9vw;
  letter-spacing: 1px;
}

.login-status.logged-in {
  color: #00ff87;
}

.login-tip {
  height: 4vh;
  background: rgba(255, 107, 107, 0.15);
  border: 1px solid rgba(255, 107, 107, 0.3);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  color: #ffd93d;
  font-size: 0.9vw;
  margin-bottom: 1vh;
}

.login-tip a {
  color: #00d4ff;
  text-decoration: none;
  padding: 0.3vh 1vw;
  background: rgba(0, 212, 255, 0.2);
  border-radius: 4px;
  transition: all 0.3s;
}

.login-tip a:hover {
  background: rgba(0, 212, 255, 0.4);
}

/* 统计指标行 */
.metrics-row {
  height: 12vh;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5vw;
  padding: 1.5vh 0;
  box-sizing: border-box;
}

.metric-card {
  background: linear-gradient(135deg, rgba(0, 60, 120, 0.4), rgba(0, 30, 60, 0.6));
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 6px;
  padding: 1vh 1.5vw;
  display: flex;
  align-items: center;
  gap: 1vw;
  position: relative;
  overflow: hidden;
  box-shadow: 0 0 20px rgba(0, 212, 255, 0.1) inset;
}

.metric-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 3px;
  height: 100%;
  background: #00d4ff;
  box-shadow: 0 0 10px #00d4ff;
}

.metric-icon {
  width: 3.5vw;
  height: 3.5vw;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8vw;
  background: rgba(0, 212, 255, 0.15);
  color: #00d4ff;
}

.metric-icon.icon-1 { background: rgba(0, 255, 135, 0.15); color: #00ff87; }
.metric-icon.icon-2 { background: rgba(255, 217, 61, 0.15); color: #ffd93d; }
.metric-icon.icon-3 { background: rgba(199, 146, 234, 0.15); color: #c792ea; }

.metric-info {
  flex: 1;
}

.metric-value {
  font-size: 2.4vw;
  font-weight: bold;
  color: #fff;
  line-height: 1;
  font-family: 'Courier New', monospace;
  text-shadow: 0 0 10px rgba(0, 212, 255, 0.5);
}

.metric-label {
  font-size: 0.9vw;
  color: #8ec5ff;
  margin-top: 0.5vh;
  letter-spacing: 2px;
}

/* 主内容区 */
.content-area {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1.2fr 1fr;
  gap: 1vw;
  min-height: 0;
}

.col {
  display: flex;
  flex-direction: column;
  gap: 1vh;
  min-height: 0;
}

/* 面板样式 */
.panel {
  flex: 1;
  background: linear-gradient(135deg, rgba(0, 40, 80, 0.4), rgba(0, 20, 40, 0.6));
  border: 1px solid rgba(0, 212, 255, 0.25);
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  min-height: 0;
  position: relative;
  box-shadow: 0 0 20px rgba(0, 100, 200, 0.1) inset;
}

.panel::before, .panel::after {
  content: '';
  position: absolute;
  width: 12px;
  height: 12px;
  border: 2px solid #00d4ff;
}

.panel::before {
  top: -1px;
  left: -1px;
  border-right: none;
  border-bottom: none;
}

.panel::after {
  bottom: -1px;
  right: -1px;
  border-left: none;
  border-top: none;
}

.panel-title {
  height: 5vh;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 1.2vw;
  border-bottom: 1px solid rgba(0, 212, 255, 0.2);
  color: #fff;
  font-size: 1vw;
  font-weight: bold;
  letter-spacing: 2px;
  flex-shrink: 0;
}

.panel-icon {
  width: 4px;
  height: 1.6vh;
  background: #00d4ff;
  box-shadow: 0 0 6px #00d4ff;
}

.panel-body {
  flex: 1;
  padding: 1vh;
  min-height: 0;
  overflow: hidden;
}

.chart-container {
  width: 100%;
  height: 100%;
  min-height: 0;
}

/* 评论列表 */
.review-list {
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 0.8vh;
}

.review-item {
  background: rgba(0, 60, 120, 0.2);
  border-left: 2px solid #00d4ff;
  padding: 0.8vh 0.8vw;
  display: flex;
  align-items: center;
  gap: 0.8vw;
  border-radius: 3px;
  flex-shrink: 0;
}

.review-avatar {
  width: 2vw;
  height: 2vw;
  border-radius: 50%;
  background: linear-gradient(135deg, #00d4ff, #0066ff);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9vw;
  font-weight: bold;
  flex-shrink: 0;
}

.review-content {
  flex: 1;
  min-width: 0;
}

.review-user {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.75vw;
}

.user-name {
  color: #00d4ff;
  font-weight: bold;
}

.review-dest {
  color: #8ec5ff;
  font-size: 0.7vw;
}

.review-text {
  color: #c5e3ff;
  font-size: 0.8vw;
  margin-top: 0.3vh;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.review-rating {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
}

.rating-score {
  color: #ffd93d;
  font-size: 1vw;
  font-weight: bold;
}

.rating-star {
  color: #ffd93d;
  font-size: 0.7vw;
}

/* 景点列表 */
.dest-list {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.6vh;
}

.dest-item {
  display: flex;
  align-items: center;
  gap: 0.8vw;
  padding: 0.8vh 0.8vw;
  background: rgba(0, 60, 120, 0.15);
  border-radius: 3px;
  border-bottom: 1px solid rgba(0, 212, 255, 0.1);
  flex-shrink: 0;
}

.dest-index {
  width: 1.8vw;
  height: 1.8vw;
  background: rgba(0, 212, 255, 0.2);
  border: 1px solid #00d4ff;
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #00d4ff;
  font-weight: bold;
  font-size: 0.8vw;
  font-family: 'Courier New', monospace;
  flex-shrink: 0;
}

.dest-item:nth-child(1) .dest-index { background: rgba(255, 107, 107, 0.25); border-color: #ff6b6b; color: #ff6b6b; }
.dest-item:nth-child(2) .dest-index { background: rgba(255, 217, 61, 0.25); border-color: #ffd93d; color: #ffd93d; }
.dest-item:nth-child(3) .dest-index { background: rgba(0, 255, 135, 0.25); border-color: #00ff87; color: #00ff87; }

.dest-info {
  flex: 1;
  min-width: 0;
}

.dest-name {
  color: #fff;
  font-size: 0.9vw;
  font-weight: bold;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dest-location {
  color: #8ec5ff;
  font-size: 0.7vw;
  margin-top: 0.2vh;
}

.dest-rating {
  display: flex;
  align-items: center;
  gap: 3px;
  flex-shrink: 0;
}

.dest-score {
  color: #ffd93d;
  font-size: 1vw;
  font-weight: bold;
}

.dest-star {
  color: #ffd93d;
  font-size: 0.7vw;
}

.empty-tip {
  color: #8ec5ff;
  text-align: center;
  padding: 3vh 0;
  font-size: 0.9vw;
  opacity: 0.6;
}

/* 底部 */
.screen-footer {
  height: 3vh;
  border-top: 1px solid rgba(0, 212, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.footer-info {
  display: flex;
  align-items: center;
  gap: 3vw;
  color: #8ec5ff;
  font-size: 0.8vw;
  letter-spacing: 2px;
}

.footer-info span:first-child {
  color: #00ff87;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
</style>
