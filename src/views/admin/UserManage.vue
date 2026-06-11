<template>
  <div class="user-manage">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>用户管理</span>
          <div class="header-actions">
            <el-input
              v-model="searchQuery"
              placeholder="搜索用户名、邮箱、昵称"
              style="width: 300px; margin-right: 10px"
              clearable
              @input="handleSearch"
            >
              <template #prefix>
                <span>🔍</span>
              </template>
            </el-input>
            <el-button type="danger" :disabled="!selectedRows.length" @click="handleBatchDelete">
              批量删除
            </el-button>
          </div>
        </div>
      </template>

      <!-- 统计卡片 -->
      <div class="stats-cards">
        <el-row :gutter="20">
          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-icon">👥</div>
              <div class="stat-content">
                <div class="stat-value">{{ stats.totalUsers }}</div>
                <div class="stat-label">用户总数</div>
              </div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-icon">📝</div>
              <div class="stat-content">
                <div class="stat-value">{{ stats.totalReviews }}</div>
                <div class="stat-label">评论总数</div>
              </div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-icon">🔖</div>
              <div class="stat-content">
                <div class="stat-value">{{ stats.totalFavorites }}</div>
                <div class="stat-label">收藏总数</div>
              </div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-icon">❤️</div>
              <div class="stat-content">
                <div class="stat-value">{{ stats.totalLikes }}</div>
                <div class="stat-label">点赞总数</div>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>

      <el-table
        :data="users"
        v-loading="loading"
        stripe
        @selection-change="handleSelectionChange"
        style="margin-top: 20px"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="用户信息" min-width="200">
          <template #default="{ row }">
            <div class="user-info">
              <div class="user-avatar">
                {{ (row.nickname || row.username).charAt(0).toUpperCase() }}
              </div>
              <div class="user-details">
                <div class="username">{{ row.nickname || row.username }}</div>
                <div class="email">{{ row.email }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="username" label="用户名" width="150" />
        <el-table-column prop="reviewCount" label="评论数" width="100">
          <template #default="{ row }">
            <el-tag type="info">{{ row.reviewCount }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="favoriteCount" label="收藏数" width="100">
          <template #default="{ row }">
            <el-tag type="warning">{{ row.favoriteCount }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="likeCount" label="点赞数" width="100">
          <template #default="{ row }">
            <el-tag type="danger">{{ row.likeCount }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="注册时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button type="danger" size="small" @click="handleDelete(row.id)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination" v-if="total > 0">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 编辑用户对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      title="编辑用户"
      width="500px"
    >
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="editForm.email" disabled />
        </el-form-item>
        <el-form-item label="昵称">
          <el-input v-model="editForm.nickname" placeholder="请输入昵称" />
        </el-form-item>
        <el-form-item label="个人简介">
          <el-input
            v-model="editForm.bio"
            type="textarea"
            :rows="3"
            placeholder="请输入个人简介"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave" :loading="saving">
          保存
        </el-button>
      </template>
    </el-dialog>

    <!-- 用户详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="用户详情"
      width="600px"
    >
      <div v-if="currentUser" class="user-detail">
        <div class="detail-header">
          <div class="detail-avatar">
            {{ (currentUser.nickname || currentUser.username).charAt(0).toUpperCase() }}
          </div>
          <div class="detail-info">
            <h3>{{ currentUser.nickname || currentUser.username }}</h3>
            <p>{{ currentUser.email }}</p>
          </div>
        </div>
        <div class="detail-stats">
          <div class="detail-stat">
            <span class="stat-value">{{ currentUser.reviewCount }}</span>
            <span class="stat-label">评论</span>
          </div>
          <div class="detail-stat">
            <span class="stat-value">{{ currentUser.favoriteCount }}</span>
            <span class="stat-label">收藏</span>
          </div>
          <div class="detail-stat">
            <span class="stat-value">{{ currentUser.likeCount }}</span>
            <span class="stat-label">点赞</span>
          </div>
        </div>
        <div class="detail-bio" v-if="currentUser.bio">
          <h4>个人简介</h4>
          <p>{{ currentUser.bio }}</p>
        </div>
        <div class="detail-records">
          <h4>最近活动</h4>
          <div v-if="currentUser.userReviews && currentUser.userReviews.length > 0">
            <div v-for="review in currentUser.userReviews.slice(0, 3)" :key="review.id" class="activity-item">
              <span>评论了景点：{{ review.Destination ? review.Destination.name : '未知' }}</span>
              <span class="activity-date">{{ formatDate(review.created_at) }}</span>
            </div>
          </div>
          <div v-else class="no-activity">
            暂无活动记录
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { adminUserAPI } from '../../api/adminUsers'

const users = ref([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const searchQuery = ref('')
const selectedRows = ref([])
const stats = ref({
  totalUsers: 0,
  totalReviews: 0,
  totalFavorites: 0,
  totalLikes: 0
})

const editDialogVisible = ref(false)
const detailDialogVisible = ref(false)
const saving = ref(false)
const currentUser = ref(null)

const editForm = reactive({
  id: '',
  username: '',
  email: '',
  nickname: '',
  bio: ''
})

const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

const loadUsers = async () => {
  loading.value = true
  try {
    const res = await adminUserAPI.getUsers({
      page: currentPage.value,
      limit: pageSize.value,
      search: searchQuery.value
    })
    if (res.code === 200) {
      users.value = res.data.list
      total.value = res.data.total
    }
  } catch (error) {
    ElMessage.error('加载用户失败')
  } finally {
    loading.value = false
  }
}

const loadStats = async () => {
  try {
    const res = await adminUserAPI.getStats()
    if (res.code === 200) {
      stats.value = res.data
    }
  } catch (error) {
    console.error('加载统计失败:', error)
  }
}

const handleSearch = () => {
  currentPage.value = 1
  loadUsers()
}

const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

const handleEdit = (row) => {
  editForm.id = row.id
  editForm.username = row.username
  editForm.email = row.email
  editForm.nickname = row.nickname || ''
  editForm.bio = row.bio || ''
  editDialogVisible.value = true
}

const handleSave = async () => {
  saving.value = true
  try {
    const res = await adminUserAPI.updateUser(editForm.id, {
      nickname: editForm.nickname,
      bio: editForm.bio
    })
    if (res.code === 200) {
      ElMessage.success('更新成功')
      editDialogVisible.value = false
      loadUsers()
    } else {
      ElMessage.error(res.message || '更新失败')
    }
  } catch (error) {
    ElMessage.error('更新失败')
  } finally {
    saving.value = false
  }
}

const handleDelete = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除该用户吗？该操作将同时删除用户的所有评论、收藏和点赞记录。', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const res = await adminUserAPI.deleteUser(id)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      loadUsers()
      loadStats()
    } else {
      ElMessage.error(res.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const handleBatchDelete = async () => {
  if (!selectedRows.value.length) return

  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedRows.value.length} 个用户吗？该操作将同时删除用户的所有评论、收藏和点赞记录。`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const ids = selectedRows.value.map(row => row.id)
    const res = await adminUserAPI.batchDeleteUsers(ids)
    if (res.code === 200) {
      ElMessage.success('批量删除成功')
      selectedRows.value = []
      loadUsers()
      loadStats()
    } else {
      ElMessage.error(res.message || '批量删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量删除失败')
    }
  }
}

const handleSizeChange = () => {
  currentPage.value = 1
  loadUsers()
}

const handleCurrentChange = () => {
  loadUsers()
}

onMounted(() => {
  loadUsers()
  loadStats()
})
</script>

<style scoped>
.user-manage {
  width: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  align-items: center;
}

.stats-cards {
  margin-bottom: 20px;
}

.stat-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  color: white;
}

.stat-icon {
  font-size: 36px;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
}

.stat-label {
  font-size: 14px;
  opacity: 0.9;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 16px;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.username {
  font-weight: 600;
  color: #333;
}

.email {
  font-size: 12px;
  color: #999;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* 用户详情样式 */
.user-detail {
  padding: 10px 0;
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.detail-avatar {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 32px;
}

.detail-info h3 {
  margin: 0 0 8px 0;
  font-size: 24px;
  color: #333;
}

.detail-info p {
  margin: 0;
  color: #999;
  font-size: 14px;
}

.detail-stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: 20px;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 12px;
}

.detail-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.detail-stat .stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #333;
}

.detail-stat .stat-label {
  font-size: 14px;
  color: #666;
  margin-top: 5px;
}

.detail-bio {
  margin-bottom: 20px;
}

.detail-bio h4 {
  margin: 0 0 10px 0;
  font-size: 16px;
  color: #333;
}

.detail-bio p {
  margin: 0;
  color: #666;
  line-height: 1.6;
}

.detail-records h4 {
  margin: 0 0 15px 0;
  font-size: 16px;
  color: #333;
}

.activity-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 8px;
  margin-bottom: 10px;
  font-size: 14px;
  color: #666;
}

.activity-date {
  color: #999;
  font-size: 12px;
}

.no-activity {
  text-align: center;
  padding: 30px;
  color: #999;
  font-size: 14px;
}
</style>
