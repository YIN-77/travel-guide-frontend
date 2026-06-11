<template>
  <div class="destination-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>景点列表</span>
          <el-button type="primary" @click="$router.push('/admin/destinations/create')">
            添加景点
          </el-button>
        </div>
      </template>

      <el-table :data="destinations" style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="name" label="景点名称" />
        <el-table-column prop="location" label="地址" />
        <el-table-column prop="rating" label="评分" width="80">
          <template #default="{ row }">
            <span>⭐ {{ row.rating }}</span>
          </template>
        </el-table-column>
        <el-table-column label="标签" width="200">
          <template #default="{ row }">
            <el-tag v-for="tag in row.Tags" :key="tag.id" size="small" style="margin-right: 4px;">
              {{ tag.name }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row.id)">编辑</el-button>
            <el-button type="danger" size="small" @click="handleDelete(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-if="total > 0"
        layout="prev, pager, next"
        :total="total"
        :page-size="queryParams.limit"
        :current-page="queryParams.page"
        @current-change="handlePageChange"
        style="margin-top: 20px; justify-content: center;"
      />
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { destinationAPI } from '../../api/destinations'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()

const loading = ref(false)
const destinations = ref([])
const total = ref(0)
const queryParams = reactive({
  page: 1,
  limit: 10
})

const loadDestinations = async () => {
  loading.value = true
  try {
    const res = await destinationAPI.getList(queryParams)
    if (res.code === 200) {
      destinations.value = res.data.list
      total.value = res.data.total
    }
  } catch (error) {
    console.error('加载景点列表失败:', error)
  } finally {
    loading.value = false
  }
}

const handlePageChange = (page) => {
  queryParams.page = page
  loadDestinations()
}

const handleEdit = (id) => {
  router.push(`/admin/destinations/${id}/edit`)
}

const handleDelete = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除这个景点吗?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const res = await destinationAPI.delete(id)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      loadDestinations()
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

onMounted(() => {
  loadDestinations()
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
