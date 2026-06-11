<template>
  <div class="news-manage">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>资讯管理</span>
          <div class="header-actions">
            <el-input
              v-model="searchQuery"
              placeholder="搜索资讯标题"
              style="width: 300px; margin-right: 10px"
              clearable
              @input="handleSearch"
            >
              <template #prefix>
                <span>🔍</span>
              </template>
            </el-input>
            <el-select
              v-model="statusFilter"
              placeholder="状态筛选"
              style="width: 150px; margin-right: 10px"
              clearable
              @change="handleFilterChange"
            >
              <el-option label="全部" value="" />
              <el-option label="已发布" value="published" />
              <el-option label="草稿" value="draft" />
              <el-option label="已归档" value="archived" />
            </el-select>
            <el-select
              v-model="categoryFilter"
              placeholder="分类筛选"
              style="width: 150px; margin-right: 10px"
              clearable
              @change="handleFilterChange"
            >
              <el-option label="全部分类" value="" />
              <el-option label="行业动态" value="行业动态" />
              <el-option label="签证政策" value="签证政策" />
              <el-option label="目的地推荐" value="目的地推荐" />
              <el-option label="活动预告" value="活动预告" />
              <el-option label="特惠信息" value="特惠信息" />
            </el-select>
            <el-button type="danger" :disabled="!selectedRows.length" @click="handleBatchDelete">
              批量删除
            </el-button>
            <el-button type="primary" @click="handleCreate">
              新建资讯
            </el-button>
          </div>
        </div>
      </template>

      <!-- 统计卡片 -->
      <div class="stats-cards">
        <el-row :gutter="20">
          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-icon">📰</div>
              <div class="stat-content">
                <div class="stat-value">{{ stats.totalNews }}</div>
                <div class="stat-label">资讯总数</div>
              </div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-icon published">✅</div>
              <div class="stat-content">
                <div class="stat-value">{{ stats.publishedNews }}</div>
                <div class="stat-label">已发布</div>
              </div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-icon top">🔥</div>
              <div class="stat-content">
                <div class="stat-value">{{ stats.topNews }}</div>
                <div class="stat-label">置顶资讯</div>
              </div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-icon today">📈</div>
              <div class="stat-content">
                <div class="stat-value">{{ stats.todayNews }}</div>
                <div class="stat-label">今日新增</div>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>

      <el-table
        :data="newsList"
        v-loading="loading"
        stripe
        @selection-change="handleSelectionChange"
        style="margin-top: 20px"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="title" label="资讯标题" min-width="200" show-overflow-tooltip />
        <el-table-column prop="category" label="分类" width="120">
          <template #default="{ row }">
            <el-tag size="small" v-if="row.category">{{ row.category }}</el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="author" label="作者/来源" width="120">
          <template #default="{ row }">
            <span v-if="row.author">{{ row.author }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="views" label="浏览" width="80">
          <template #default="{ row }">
            {{ row.views || 0 }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="is_top" label="置顶" width="80">
          <template #default="{ row }">
            <el-tag :type="row.is_top ? 'danger' : 'info'" size="small">
              {{ row.is_top ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleView(row)">
              查看
            </el-button>
            <el-button
              :type="row.status === 'published' ? 'warning' : 'success'"
              size="small"
              @click="handleToggleStatus(row)"
            >
              {{ row.status === 'published' ? '下架' : '发布' }}
            </el-button>
            <el-button
              :type="row.is_top ? 'info' : 'warning'"
              size="small"
              @click="handleToggleTop(row)"
            >
              {{ row.is_top ? '取消置顶' : '置顶' }}
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

    <!-- 资讯详情弹窗 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="资讯详情"
      width="800px"
      top="5vh"
    >
      <div v-if="currentNews" class="news-detail">
        <div class="detail-header">
          <h2>{{ currentNews.title }}</h2>
          <div class="detail-tags">
            <el-tag :type="getStatusType(currentNews.status)">
              {{ getStatusText(currentNews.status) }}
            </el-tag>
            <el-tag v-if="currentNews.is_top" type="danger">置顶</el-tag>
            <el-tag v-if="currentNews.category" type="info">{{ currentNews.category }}</el-tag>
          </div>
        </div>

        <div class="detail-meta">
          <span>作者/来源：{{ currentNews.author || '-' }}</span>
          <span>浏览：{{ currentNews.views || 0 }}</span>
          <span>发布时间：{{ currentNews.published_at ? formatDate(currentNews.published_at) : '-' }}</span>
          <span>创建时间：{{ formatDate(currentNews.created_at) }}</span>
        </div>

        <div class="detail-cover" v-if="currentNews.cover_image">
          <img :src="currentNews.cover_image" alt="封面图" />
        </div>

        <div class="detail-description" v-if="currentNews.description">
          <h4>摘要</h4>
          <p>{{ currentNews.description }}</p>
        </div>

        <div class="detail-content" v-if="currentNews.content">
          <h4>正文内容</h4>
          <div class="content-text" v-html="currentNews.content"></div>
        </div>
      </div>
    </el-dialog>

    <!-- 新建资讯弹窗 -->
    <el-dialog
      v-model="createDialogVisible"
      title="新建资讯"
      width="700px"
      top="5vh"
    >
      <el-form :model="newsForm" label-width="100px">
        <el-form-item label="标题" required>
          <el-input v-model="newsForm.title" placeholder="请输入资讯标题" />
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="newsForm.category" placeholder="请选择分类" style="width: 100%">
            <el-option label="行业动态" value="行业动态" />
            <el-option label="签证政策" value="签证政策" />
            <el-option label="目的地推荐" value="目的地推荐" />
            <el-option label="活动预告" value="活动预告" />
            <el-option label="特惠信息" value="特惠信息" />
          </el-select>
        </el-form-item>
        <el-form-item label="作者/来源">
          <el-input v-model="newsForm.author" placeholder="请输入作者或来源" />
        </el-form-item>
        <el-form-item label="封面图片">
          <el-input v-model="newsForm.cover_image" placeholder="请输入封面图片URL" />
        </el-form-item>
        <el-form-item label="摘要">
          <el-input
            v-model="newsForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入资讯摘要"
          />
        </el-form-item>
        <el-form-item label="正文内容">
          <el-input
            v-model="newsForm.content"
            type="textarea"
            :rows="6"
            placeholder="请输入正文内容"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="newsForm.status">
            <el-radio label="draft">草稿</el-radio>
            <el-radio label="published">发布</el-radio>
            <el-radio label="archived">归档</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="设为置顶">
          <el-switch v-model="newsForm.is_top" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitCreate" :loading="submitLoading">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { adminNewsAPI } from '../../api/adminNews'

const loading = ref(false)
const newsList = ref([])
const selectedRows = ref([])
const searchQuery = ref('')
const statusFilter = ref('')
const categoryFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const detailDialogVisible = ref(false)
const currentNews = ref(null)
const createDialogVisible = ref(false)
const submitLoading = ref(false)

const newsForm = ref({
  title: '',
  category: '',
  author: '',
  cover_image: '',
  description: '',
  content: '',
  status: 'draft',
  is_top: false
})

const stats = ref({
  totalNews: 0,
  publishedNews: 0,
  topNews: 0,
  todayNews: 0
})

const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

const getStatusType = (status) => {
  const types = {
    published: 'success',
    draft: 'warning',
    archived: 'info'
  }
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = {
    published: '已发布',
    draft: '草稿',
    archived: '已归档'
  }
  return texts[status] || status
}

const loadNews = async () => {
  loading.value = true
  try {
    const res = await adminNewsAPI.getAll({
      page: currentPage.value,
      limit: pageSize.value,
      keyword: searchQuery.value,
      status: statusFilter.value,
      category: categoryFilter.value
    })
    if (res.code === 200) {
      newsList.value = res.data.list
      total.value = res.data.total
    }
  } catch (error) {
    ElMessage.error('加载资讯列表失败')
  } finally {
    loading.value = false
  }
}

const loadStats = async () => {
  try {
    const res = await adminNewsAPI.getStats()
    if (res.code === 200) {
      stats.value = res.data
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

const handleSearch = () => {
  currentPage.value = 1
  loadNews()
}

const handleFilterChange = () => {
  currentPage.value = 1
  loadNews()
}

const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
  loadNews()
}

const handleCurrentChange = (page) => {
  currentPage.value = page
  loadNews()
}

const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

const handleView = async (row) => {
  try {
    const res = await adminNewsAPI.getById(row.id)
    if (res.code === 200) {
      currentNews.value = res.data
      detailDialogVisible.value = true
    }
  } catch (error) {
    ElMessage.error('加载资讯详情失败')
  }
}

const handleToggleStatus = async (row) => {
  try {
    const newStatus = row.status === 'published' ? 'draft' : 'published'
    const res = await adminNewsAPI.update(row.id, { status: newStatus })
    if (res.code === 200) {
      ElMessage.success('状态更新成功')
      loadNews()
      loadStats()
    }
  } catch (error) {
    ElMessage.error('更新状态失败')
  }
}

const handleToggleTop = async (row) => {
  try {
    const res = await adminNewsAPI.update(row.id, { is_top: !row.is_top })
    if (res.code === 200) {
      ElMessage.success(row.is_top ? '已取消置顶' : '已设为置顶')
      loadNews()
      loadStats()
    }
  } catch (error) {
    ElMessage.error('更新置顶状态失败')
  }
}

const handleDelete = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除这个资讯吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const res = await adminNewsAPI.delete(id)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      loadNews()
      loadStats()
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const handleBatchDelete = async () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请选择要删除的资讯')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedRows.value.length} 个资讯吗？`,
      '批量删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const ids = selectedRows.value.map(row => row.id)
    const res = await adminNewsAPI.batchDelete(ids)
    if (res.code === 200) {
      ElMessage.success(res.message || '批量删除成功')
      loadNews()
      loadStats()
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量删除失败')
    }
  }
}

const handleCreate = () => {
  newsForm.value = {
    title: '',
    category: '',
    author: '',
    cover_image: '',
    description: '',
    content: '',
    status: 'draft',
    is_top: false
  }
  createDialogVisible.value = true
}

const handleSubmitCreate = async () => {
  if (!newsForm.value.title) {
    ElMessage.warning('请输入资讯标题')
    return
  }

  submitLoading.value = true
  try {
    const res = await adminNewsAPI.create(newsForm.value)
    if (res.code === 200) {
      ElMessage.success('创建成功')
      createDialogVisible.value = false
      loadNews()
      loadStats()
    }
  } catch (error) {
    ElMessage.error('创建失败')
  } finally {
    submitLoading.value = false
  }
}

onMounted(() => {
  loadNews()
  loadStats()
})
</script>

<style scoped>
.news-manage {
  padding: 0;
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
  background: white;
  padding: 20px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 15px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.stat-icon.published {
  background: #ecfdf5;
}

.stat-icon.top {
  background: #fef2f2;
}

.stat-icon.today {
  background: #fef3c7;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin: 0;
}

.stat-label {
  font-size: 14px;
  color: #999;
  margin: 5px 0 0 0;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.news-detail {
  max-height: 70vh;
  overflow-y: auto;
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
}

.detail-header h2 {
  margin: 0;
}

.detail-tags {
  display: flex;
  gap: 8px;
}

.detail-meta {
  display: flex;
  gap: 20px;
  color: #666;
  font-size: 14px;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
  flex-wrap: wrap;
}

.detail-cover {
  margin-bottom: 20px;
}

.detail-cover img {
  max-width: 100%;
  border-radius: 8px;
}

.detail-description {
  margin-bottom: 20px;
}

.detail-description h4 {
  margin: 0 0 10px 0;
  color: #333;
}

.detail-description p {
  margin: 0;
  color: #666;
  line-height: 1.6;
}

.detail-content {
  margin-bottom: 20px;
}

.detail-content h4 {
  margin: 0 0 10px 0;
  color: #333;
}

.content-text {
  color: #666;
  line-height: 1.8;
}
</style>
