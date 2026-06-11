# 旅游指南共享详情网页 - 技术架构文档

## 1. 技术选型

| 类型 | 技术 | 版本 | 说明 |
|------|------|------|------|
| 框架 | Vue | 3.4.x | 前端框架，使用组合式API |
| 构建工具 | Vite | 5.4.x | 快速构建工具，支持热更新 |
| 样式 | CSS3 | - | 原生CSS，包含渐变、Flex/Grid布局 |
| 语言 | JavaScript | ES6+ | 现代JavaScript特性 |

## 2. 文件结构设计

```
/
├── index.html                    # 入口HTML文件
├── package.json                  # 项目配置与依赖
├── vite.config.js               # Vite配置文件
├── dist/                        # 构建产物目录
│   ├── index.html
│   └── assets/
│       ├── index-*.css
│       └── index-*.js
└── src/
    ├── main.js                  # 主入口JS文件
    ├── App.vue                  # 根组件
    ├── style.css                # 全局样式文件
    ├── components/
    │   ├── Sidebar.vue          # 左侧菜单栏组件
    │   ├── SearchBar.vue        # 顶部搜索栏组件
    │   └── DestinationDetail.vue # 旅游详情组件
    └── data/
        ├── destinations.js      # 景点数据（16个旅游目的地）
        ├── menus.js             # 菜单数据（7个导航项）
        └── filters.js           # 筛选数据（6个筛选选项）
```

## 3. 数据结构设计

### 3.1 旅游目的地数据结构
```javascript
{
  id: number,           // 景点唯一标识
  name: string,         // 景点名称
  description: string,  // 景点介绍
  image: string,        // 景点图片URL
  location: string,     // 景点地址
  rating: number,       // 景点评分（1-5）
  tags: string[],       // 景点标签
  reviews: [{           // 用户评价列表
    id: number,         // 评价ID
    user: string,       // 用户名
    rating: number,     // 评价星级
    content: string     // 评价内容
  }]
}
```

### 3.2 菜单数据结构
```javascript
{
  id: number,           // 菜单ID
  name: string,         // 菜单名称
  icon: string,         // 菜单图标（emoji）
  link: string          // 菜单链接标识
}
```

### 3.3 筛选数据结构
```javascript
{
  value: string,        // 筛选值
  label: string         // 显示标签
}
```

## 4. 主要功能模块和技术实现路径

### 4.1 左侧菜单栏 (Sidebar)
- **功能**：
  - 显示7个导航菜单列表
  - 菜单项点击高亮激活状态
  - 响应式布局适配移动端
- **技术实现**：
  - Vue 3 组件，使用 `<script setup>` 语法
  - Props：`menus`（菜单列表）、`activeMenu`（当前激活菜单ID）
  - Emits：`select`（菜单点击事件）
  - CSS Flex布局，渐变背景色

### 4.2 顶部搜索栏 (SearchBar)
- **功能**：
  - 搜索框输入关键词实时搜索
  - 下拉框按类型筛选（全部类型、海滩度假、山川探险、城市观光、文化历史、自然风光）
  - 搜索按钮触发搜索
- **技术实现**：
  - Vue 3 组件，使用 v-model 双向绑定
  - Props：`searchQuery`（搜索关键词）、`selectedFilter`（选中的筛选值）、`filterOptions`（筛选选项列表）
  - Emits：`update:searchQuery`、`update:selectedFilter`、`search`
  - 使用原生 `<select>` 元素实现下拉框

### 4.3 目的地列表 (App.vue)
- **功能**：
  - 表格形式展示景点列表
  - 显示序号、景点名称、景点地址、景点类型、景点评分、操作（详情按钮）
  - 支持搜索和筛选后的结果展示
- **技术实现**：
  - 使用 `computed` 计算属性实现筛选逻辑
  - 表格布局，支持空状态提示

### 4.4 目的地详情 (DestinationDetail)
- **功能**：
  - 展示目的地大图和基本信息
  - 显示景点标签
  - 展示详细介绍和用户评价列表
- **技术实现**：
  - Vue 3 组件
  - Props：`destination`（目的地对象）
  - CSS 渐变遮罩层展示标题

## 5. 核心 API/类/函数

| 名称 | 描述 | 参数 | 返回值 |
|------|------|------|--------|
| filteredDestinations | 计算属性：根据搜索关键词和筛选条件过滤景点列表 | 无（响应式依赖） | Destination[] |
| selectMenu | 切换菜单激活状态 | id: number | void |
| viewDestination | 查看景点详情 | id: number | void |

## 6. 部署计划

| 阶段 | 交付物 | 说明 |
|------|--------|------|
| 1. 项目初始化 | package.json, vite.config.js, index.html | 使用 Vite 初始化 Vue 项目 |
| 2. 组件开发 | src/components/*.vue | 实现 Sidebar、SearchBar、DestinationDetail 组件 |
| 3. 数据准备 | src/data/*.js | 准备菜单、筛选、景点数据 |
| 4. 主应用集成 | src/App.vue, src/main.js | 组合所有组件，实现业务逻辑 |
| 5. 样式实现 | src/style.css | 实现全局样式和组件样式 |
| 6. 测试验证 | npm run build | 构建验证和开发服务器测试 |

## 7. 运行命令

| 命令 | 说明 |
|------|------|
| npm install | 安装依赖 |
| npm run dev | 启动开发服务器（默认端口 5173） |
| npm run build | 构建生产版本 |
| npm run preview | 预览构建产物 |
