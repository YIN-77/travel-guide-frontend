<template>
  <div class="profile-page">
    <Navbar />
    <div class="container">
      <Sidebar />
      
      <main class="main-content">
        <div class="scrollable-content">
          <!-- 登录提示 -->
          <div v-if="!isLoggedIn" class="login-tip">
            <div class="tip-content">
              <span class="tip-icon">🔐</span>
              <h2>请先登录</h2>
              <p>登录后可查看和管理您的个人收藏、点赞、评论等信息</p>
              <button class="login-btn" @click="goToLogin">去登录</button>
            </div>
          </div>

          <!-- 已登录用户的个人中心内容 -->
          <div v-else class="profile-content">
            <div class="profile-card">
              <div class="profile-header">
                <div class="avatar-section">
                  <div class="avatar-wrapper">
                    <img 
                      v-if="authStore.user?.avatar" 
                      :src="processAvatarUrl(authStore.user.avatar)" 
                      class="user-avatar" 
                      alt="头像" 
                    />
                    <div v-else class="user-avatar default-avatar">
                      <span class="avatar-text">{{ userInitial }}</span>
                    </div>
                    <div class="avatar-overlay" @click="triggerAvatarUpload">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                        <circle cx="12" cy="13" r="4"/>
                      </svg>
                    </div>
                  </div>
                  <input 
                    type="file" 
                    ref="avatarInput" 
                    accept="image/*" 
                    style="display: none" 
                    @change="handleAvatarChange"
                  />
                </div>

                <div class="user-info">
                  <h1 class="user-name">{{ authStore.user?.nickname || authStore.user?.username }}</h1>
                  <p class="user-email">{{ authStore.user?.email }}</p>
                  <p class="user-bio" v-if="authStore.user?.bio">{{ authStore.user.bio }}</p>
                </div>
              </div>

              <div class="profile-tabs">
                <button 
                  class="tab-btn" 
                  :class="{ active: activeTab === 'favorites' }"
                  @click="activeTab = 'favorites'"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                  </svg>
                  我的收藏
                </button>
                <button 
                  class="tab-btn" 
                  :class="{ active: activeTab === 'likes' }"
                  @click="activeTab = 'likes'"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 0 5.5 5.5 0 0 0 0 7.78L5.67 12 4.61 13.06a5.5 5.5 0 0 0 0 7.78 5.5 5.5 0 0 0 7.78 0L12 18.33l1.06 1.06a5.5 5.5 0 0 0 7.78 0 5.5 5.5 0 0 0 0-7.78L18.33 12 20.84 9.39a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                  我的点赞
                </button>
                <button 
                  class="tab-btn" 
                  :class="{ active: activeTab === 'reviews' }"
                  @click="activeTab = 'reviews'"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z"/>
                  </svg>
                  我的评论
                </button>
                <button 
                  class="tab-btn" 
                  :class="{ active: activeTab === 'notifications' }"
                  @click="activeTab = 'notifications'"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                  </svg>
                  消息通知
                  <span v-if="unreadCount > 0" class="notification-badge">{{ unreadCount }}</span>
                </button>
                <button 
                  class="tab-btn" 
                  :class="{ active: activeTab === 'settings' }"
                  @click="activeTab = 'settings'"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="3"/>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82 1.65 1.65 0 0 0 1 1.51 V21"/>
                  </svg>
                  个人设置
                </button>
              </div>

              <div class="tab-content">
                <div class="tab-panel">
                  <!-- 我的收藏 -->
                  <div v-if="activeTab === 'favorites'">
                    <div class="interaction-tabs">
                      <button
                        v-for="type in interactionTypes"
                        :key="type.value"
                        class="interaction-tab"
                        :class="{ active: activeInteractionTab === type.value }"
                        @click="activeInteractionTab = type.value"
                      >
                        {{ type.label }}
                        <span class="count">{{ getInteractionCount(favoriteCounts, type.value) }}</span>
                      </button>
                    </div>

                    <!-- 景点收藏 -->
                    <div v-if="activeInteractionTab === 'destination'">
                      <div v-if="favoriteDestinations.length === 0" class="empty-state">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                          <circle cx="12" cy="10" r="3"/>
                        </svg>
                        <p>暂无收藏的景点</p>
                        <span>去发现更多精彩吧！</span>
                      </div>
                      <div v-else class="items-grid">
                        <div
                          v-for="item in favoriteDestinations"
                          :key="item.id"
                          class="item-card destination-card"
                          @click="goToDestination(item.target.id)"
                        >
                          <div class="card-image">
                            <img :src="processCardImageUrl(item.target.image)" :alt="item.target.name" />
                            <div class="card-rating">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="#fbbf24" stroke="#fbbf24" stroke-width="2">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                              </svg>
                              {{ item.target.rating || 0 }}
                            </div>
                          </div>
                          <div class="card-content">
                            <h3 class="card-title">{{ item.target.name }}</h3>
                            <div class="card-location">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                                <circle cx="12" cy="10" r="3"/>
                              </svg>
                              {{ item.target.location || '未知地点' }}
                            </div>
                            <p class="card-desc">{{ item.target.description ? item.target.description.substring(0, 60) + '...' : '暂无描述' }}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- 行程规划收藏 -->
                    <div v-if="activeInteractionTab === 'itinerary'">
                      <div v-if="favoriteItineraries.length === 0" class="empty-state">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                          <path d="M9 20l-5.447-2.724A1 1 0 0 1 3 16.382V5.618a1 1 0 0 1 1.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0 0 21 18.382V7.618a1 1 0 0 0-.553-.894L15 4m0 13V4m0 0L9 7"/>
                        </svg>
                        <p>暂无收藏的行程规划</p>
                        <span>去发现更多精彩行程吧！</span>
                      </div>
                      <div v-else class="items-grid">
                        <div
                          v-for="item in favoriteItineraries"
                          :key="item.id"
                          class="item-card itinerary-card"
                          @click="goToItinerary(item.target.id)"
                        >
                          <div class="card-image">
                            <img :src="processCardImageUrl(item.target.coverImage || item.target.cover_image)" :alt="item.target.title" />
                            <div class="card-badge official" v-if="item.target.isOfficial">官方</div>
                          </div>
                          <div class="card-content">
                            <h3 class="card-title">{{ item.target.title }}</h3>
                            <div class="card-meta">
                              <span class="meta-item">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                  <line x1="16" y1="2" x2="16" y2="6"/>
                                  <line x1="8" y1="2" x2="8" y2="6"/>
                                  <line x1="3" y1="10" x2="21" y2="10"/>
                                </svg>
                                {{ item.target.daysCount || item.target.days?.length || 0 }}天
                              </span>
                            </div>
                            <p class="card-desc">{{ item.target.description ? item.target.description.substring(0, 60) + '...' : '暂无描述' }}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- 旅游攻略收藏 -->
                    <div v-if="activeInteractionTab === 'guide'">
                      <div v-if="favoriteGuides.length === 0" class="empty-state">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                        </svg>
                        <p>暂无收藏的旅游攻略</p>
                        <span>去发现更多精彩攻略吧！</span>
                      </div>
                      <div v-else class="items-grid">
                        <div
                          v-for="item in favoriteGuides"
                          :key="item.id"
                          class="item-card guide-card"
                          @click="goToGuide(item.target.id)"
                        >
                          <div class="card-image">
                            <img :src="processCardImageUrl(item.target.cover_image || item.target.coverImage)" :alt="item.target.title" />
                            <div class="card-badge official" v-if="item.target.is_official">官方</div>
                          </div>
                          <div class="card-content">
                            <h3 class="card-title">{{ item.target.title }}</h3>
                            <div class="card-author">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                <circle cx="12" cy="7" r="4"/>
                              </svg>
                              {{ item.target.author_name || '匿名' }}
                            </div>
                            <p class="card-desc">{{ item.target.description ? item.target.description.substring(0, 60) + '...' : '暂无描述' }}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- 旅游咨讯收藏 -->
                    <div v-if="activeInteractionTab === 'news'">
                      <div v-if="favoriteNews.length === 0" class="empty-state">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                          <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
                          <polyline points="13 2 13 9 20 9"/>
                        </svg>
                        <p>暂无收藏的旅游咨讯</p>
                        <span>去发现更多资讯吧！</span>
                      </div>
                      <div v-else class="items-grid">
                        <div
                          v-for="item in favoriteNews"
                          :key="item.id"
                          class="item-card news-card"
                          @click="goToNews(item.target.id)"
                        >
                          <div class="card-image">
                            <img :src="processCardImageUrl(item.target.cover_image)" :alt="item.target.title" />
                            <div class="card-badge category">{{ item.target.category || '资讯' }}</div>
                          </div>
                          <div class="card-content">
                            <h3 class="card-title">{{ item.target.title }}</h3>
                            <div class="card-author">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                                <path d="M2 17l10 5 10-5"/>
                                <path d="M2 12l10 5 10-5"/>
                              </svg>
                              {{ item.target.author || '未知来源' }}
                            </div>
                            <p class="card-desc">{{ item.target.description ? item.target.description.substring(0, 60) + '...' : '暂无描述' }}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- 我的点赞 -->
                  <div v-if="activeTab === 'likes'">
                    <div class="interaction-tabs">
                      <button
                        v-for="type in interactionTypes"
                        :key="type.value"
                        class="interaction-tab"
                        :class="{ active: activeLikeTab === type.value }"
                        @click="activeLikeTab = type.value"
                      >
                        {{ type.label }}
                        <span class="count">{{ getInteractionCount(likeCounts, type.value) }}</span>
                      </button>
                    </div>

                    <!-- 景点点赞 -->
                    <div v-if="activeLikeTab === 'destination'">
                      <div v-if="likeDestinations.length === 0" class="empty-state">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                          <circle cx="12" cy="10" r="3"/>
                        </svg>
                        <p>暂无点赞的景点</p>
                        <span>去发现更多精彩吧！</span>
                      </div>
                      <div v-else class="items-grid">
                        <div
                          v-for="item in likeDestinations"
                          :key="item.id"
                          class="item-card destination-card"
                          @click="goToDestination(item.target.id)"
                        >
                          <div class="card-image">
                            <img :src="processCardImageUrl(item.target.image)" :alt="item.target.name" />
                            <div class="card-rating">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="#fbbf24" stroke="#fbbf24" stroke-width="2">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                              </svg>
                              {{ item.target.rating || 0 }}
                            </div>
                          </div>
                          <div class="card-content">
                            <h3 class="card-title">{{ item.target.name }}</h3>
                            <div class="card-location">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                                <circle cx="12" cy="10" r="3"/>
                              </svg>
                              {{ item.target.location || '未知地点' }}
                            </div>
                            <p class="card-desc">{{ item.target.description ? item.target.description.substring(0, 60) + '...' : '暂无描述' }}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- 行程规划点赞 -->
                    <div v-if="activeLikeTab === 'itinerary'">
                      <div v-if="likeItineraries.length === 0" class="empty-state">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                          <path d="M9 20l-5.447-2.724A1 1 0 0 1 3 16.382V5.618a1 1 0 0 1 1.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0 0 21 18.382V7.618a1 1 0 0 0-.553-.894L15 4m0 13V4m0 0L9 7"/>
                        </svg>
                        <p>暂无点赞的行程规划</p>
                        <span>去发现更多精彩行程吧！</span>
                      </div>
                      <div v-else class="items-grid">
                        <div
                          v-for="item in likeItineraries"
                          :key="item.id"
                          class="item-card itinerary-card"
                          @click="goToItinerary(item.target.id)"
                        >
                          <div class="card-image">
                            <img :src="processCardImageUrl(item.target.coverImage || item.target.cover_image)" :alt="item.target.title" />
                            <div class="card-badge official" v-if="item.target.isOfficial">官方</div>
                          </div>
                          <div class="card-content">
                            <h3 class="card-title">{{ item.target.title }}</h3>
                            <div class="card-meta">
                              <span class="meta-item">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                  <line x1="16" y1="2" x2="16" y2="6"/>
                                  <line x1="8" y1="2" x2="8" y2="6"/>
                                  <line x1="3" y1="10" x2="21" y2="10"/>
                                </svg>
                                {{ item.target.daysCount || item.target.days?.length || 0 }}天
                              </span>
                            </div>
                            <p class="card-desc">{{ item.target.description ? item.target.description.substring(0, 60) + '...' : '暂无描述' }}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- 旅游攻略点赞 -->
                    <div v-if="activeLikeTab === 'guide'">
                      <div v-if="likeGuides.length === 0" class="empty-state">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                        </svg>
                        <p>暂无点赞的旅游攻略</p>
                        <span>去发现更多精彩攻略吧！</span>
                      </div>
                      <div v-else class="items-grid">
                        <div
                          v-for="item in likeGuides"
                          :key="item.id"
                          class="item-card guide-card"
                          @click="goToGuide(item.target.id)"
                        >
                          <div class="card-image">
                            <img :src="processCardImageUrl(item.target.cover_image || item.target.coverImage)" :alt="item.target.title" />
                            <div class="card-badge official" v-if="item.target.is_official">官方</div>
                          </div>
                          <div class="card-content">
                            <h3 class="card-title">{{ item.target.title }}</h3>
                            <div class="card-author">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                <circle cx="12" cy="7" r="4"/>
                              </svg>
                              {{ item.target.author_name || '匿名' }}
                            </div>
                            <p class="card-desc">{{ item.target.description ? item.target.description.substring(0, 60) + '...' : '暂无描述' }}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- 旅游咨讯点赞 -->
                    <div v-if="activeLikeTab === 'news'">
                      <div v-if="likeNews.length === 0" class="empty-state">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                          <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
                          <polyline points="13 2 13 9 20 9"/>
                        </svg>
                        <p>暂无点赞的旅游咨讯</p>
                        <span>去发现更多资讯吧！</span>
                      </div>
                      <div v-else class="items-grid">
                        <div
                          v-for="item in likeNews"
                          :key="item.id"
                          class="item-card news-card"
                          @click="goToNews(item.target.id)"
                        >
                          <div class="card-image">
                            <img :src="processCardImageUrl(item.target.cover_image)" :alt="item.target.title" />
                            <div class="card-badge category">{{ item.target.category || '资讯' }}</div>
                          </div>
                          <div class="card-content">
                            <h3 class="card-title">{{ item.target.title }}</h3>
                            <div class="card-author">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                                <path d="M2 17l10 5 10-5"/>
                                <path d="M2 12l10 5 10-5"/>
                              </svg>
                              {{ item.target.author || '未知来源' }}
                            </div>
                            <p class="card-desc">{{ item.target.description ? item.target.description.substring(0, 60) + '...' : '暂无描述' }}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- 我的评论 -->
                  <div v-if="activeTab === 'reviews'">
                    <div v-if="reviews.length === 0" class="empty-state">
                      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z"/>
                      </svg>
                      <p>暂无评论</p>
                      <span>去分享你的旅行体验吧！</span>
                    </div>
                    <div v-else class="reviews-container">
                      <div v-for="review in reviews" :key="review.id" class="review-card">
                        <div class="review-header">
                          <div class="review-destination">
                            <h3 class="destination-name">{{ review.Destination?.name || '未知景点' }}</h3>
                            <div class="review-rating">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="#fbbf24" stroke="#fbbf24" stroke-width="2">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                              </svg>
                              {{ review.rating }}
                            </div>
                          </div>
                          <button class="delete-btn" @click="deleteReview(review.id)">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                              <polyline points="3 6 5 6 21 6"/>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            </svg>
                            删除
                          </button>
                        </div>
                        <p class="review-content">{{ review.content }}</p>
                        <p class="review-date">{{ formatDate(review.created_at) }}</p>
                      </div>
                    </div>
                  </div>

                  <!-- 消息通知 -->
                  <div v-if="activeTab === 'notifications'" class="notifications-container">
                    <div v-if="notifications.length === 0" class="empty-state">
                      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                      </svg>
                      <p>暂无消息通知</p>
                      <span>您的互动消息会在这里显示</span>
                    </div>
                    <div v-else>
                      <div class="notifications-header">
                        <button class="mark-all-read" @click="markAllRead">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                          全部标为已读
                        </button>
                      </div>
                      <div class="notifications-list">
                        <div 
                          v-for="notification in notifications" 
                          :key="notification.id" 
                          class="notification-item"
                          :class="{ unread: !notification.isRead }"
                          @click="markNotificationRead(notification.id)"
                        >
                          <div class="notification-icon">
                            <svg v-if="notification.type === 'like'" width="20" height="20" viewBox="0 0 24 24" fill="#ef4444" stroke="#ef4444" stroke-width="2">
                              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 0 5.5 5.5 0 0 0 0 7.78L5.67 12 4.61 13.06a5.5 5.5 0 0 0 0 7.78 5.5 5.5 0 0 0 7.78 0L12 18.33l1.06 1.06a5.5 5.5 0 0 0 7.78 0 5.5 5.5 0 0 0 0-7.78L18.33 12 20.84 9.39a5.5 5.5 0 0 0 0-7.78z"/>
                            </svg>
                            <svg v-else-if="notification.type === 'favorite'" width="20" height="20" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" stroke-width="2">
                              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                            </svg>
                            <svg v-else-if="notification.type === 'comment'" width="20" height="20" viewBox="0 0 24 24" fill="#3b82f6" stroke="#3b82f6" stroke-width="2">
                              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z"/>
                            </svg>
                            <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="#64748b" stroke="#64748b" stroke-width="2">
                              <circle cx="12" cy="12" r="3"/>
                            </svg>
                          </div>
                          <div class="notification-content">
                            <p class="notification-text">{{ notification.content }}</p>
                            <span class="notification-time">{{ formatNotificationTime(notification.created_at) }}</span>
                          </div>
                          <button class="notification-delete" @click.stop="deleteNotification(notification.id)">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                              <polyline points="3 6 5 6 21 6"/>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- 个人设置 -->
                  <div v-if="activeTab === 'settings'" class="settings-container">
                    <div class="settings-card">
                      <h2 class="section-title">个人资料</h2>
                      <div class="form-group">
                        <label>昵称</label>
                        <input v-model="settingsForm.nickname" type="text" placeholder="请输入昵称" />
                      </div>
                      <div class="form-group">
                        <label>个人简介</label>
                        <textarea v-model="settingsForm.bio" placeholder="介绍一下自己吧" rows="4"></textarea>
                      </div>
                      <button class="save-btn" @click="saveProfile" :disabled="saving">
                        {{ saving ? '保存中...' : '保存修改' }}
                      </button>
                    </div>

                    <div class="settings-card mt-4">
                      <h2 class="section-title">修改密码</h2>
                      <div class="form-group">
                        <label>原密码</label>
                        <input v-model="passwordForm.oldPassword" type="password" placeholder="请输入原密码" />
                      </div>
                      <div class="form-group">
                        <label>新密码</label>
                        <input v-model="passwordForm.newPassword" type="password" placeholder="请输入新密码（至少6位）" />
                      </div>
                      <div class="form-group">
                        <label>确认新密码</label>
                        <input v-model="passwordForm.confirmPassword" type="password" placeholder="请再次输入新密码" />
                      </div>
                      <button class="save-btn secondary" @click="changePassword" :disabled="savingPassword">
                        {{ savingPassword ? '修改中...' : '修改密码' }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <MobileBottomNav />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { userAPI } from '../api/user'
import { notificationAPI } from '../api/notifications'
import { ElMessage } from 'element-plus'
import Navbar from '../components/Navbar.vue'
import Sidebar from '../components/Sidebar.vue'
import MobileBottomNav from '../components/MobileBottomNav.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const activeTab = ref('favorites')
const favorites = ref([])
const likes = ref([])
const reviews = ref([])
const notifications = ref([])
const unreadCount = ref(0)
const saving = ref(false)
const avatarInput = ref(null)

// 新增：分类收藏/点赞
const activeInteractionTab = ref('destination')
const activeLikeTab = ref('destination')
const interactionTypes = [
  { label: '景点', value: 'destination' },
  { label: '行程规划', value: 'itinerary' },
  { label: '旅游攻略', value: 'guide' },
  { label: '旅游咨讯', value: 'news' }
]
const favoriteCounts = ref({})
const likeCounts = ref({})
const favoriteDestinations = ref([])
const favoriteItineraries = ref([])
const favoriteGuides = ref([])
const favoriteNews = ref([])
const likeDestinations = ref([])
const likeItineraries = ref([])
const likeGuides = ref([])
const likeNews = ref([])

const settingsForm = ref({
  nickname: '',
  bio: ''
})

const passwordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const savingPassword = ref(false)

const userInitial = computed(() => {
  return (authStore.user?.nickname || authStore.user?.username || 'U').charAt(0).toUpperCase()
})

const isLoggedIn = computed(() => authStore.isUserLoggedIn)

const goToLogin = () => {
  router.push('/')
}

const processAvatarUrl = (url) => {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url
  }
  return `http://localhost:3000${url.startsWith('/') ? '' : '/'}${url}`
}

const processCardImageUrl = (url) => {
  if (!url) return 'https://via.placeholder.com/400x300?text=No+Image'
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url
  }
  return `http://localhost:3000${url.startsWith('/') ? '' : '/'}${url}`
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN')
}

const triggerAvatarUpload = () => {
  avatarInput.value?.click()
}

const handleAvatarChange = async (e) => {
  const file = e.target.files[0]
  if (!file) return

  try {
    const reader = new FileReader()
    reader.onload = async (event) => {
      const avatarUrl = event.target.result
      
      await userAPI.updateProfile({ avatar: avatarUrl })
      authStore.user = { ...authStore.user, avatar: avatarUrl }
      localStorage.setItem('user', JSON.stringify(authStore.user))
    }
    reader.readAsDataURL(file)
  } catch (error) {
    console.error('上传头像失败:', error)
  }
}

const loadFavorites = async () => {
  try {
    const res = await userAPI.getFavorites()
    if (res.code === 200) {
      favorites.value = res.data
    }
  } catch (error) {
    console.error('加载收藏失败:', error)
  }
}

const loadLikes = async () => {
  try {
    const res = await userAPI.getLikes()
    if (res.code === 200) {
      likes.value = res.data
    }
  } catch (error) {
    console.error('加载点赞失败:', error)
  }
}

// 加载分类收藏
const loadAllFavorites = async () => {
  try {
    const types = ['destination', 'itinerary', 'guide', 'news']
    const counts = {}
    const categorized = {
      destination: [],
      itinerary: [],
      guide: [],
      news: []
    }

    for (const type of types) {
      const res = await userAPI.getAllFavorites(type)
      if (res.code === 200) {
        const list = res.data.list || []
        counts[type] = list.length
        categorized[type] = list.filter(item => item.target)
      }
    }

    favoriteCounts.value = counts
    favoriteDestinations.value = categorized.destination
    favoriteItineraries.value = categorized.itinerary
    favoriteGuides.value = categorized.guide
    favoriteNews.value = categorized.news
  } catch (error) {
    console.error('加载分类收藏失败:', error)
  }
}

// 加载分类点赞
const loadAllLikes = async () => {
  try {
    const types = ['destination', 'itinerary', 'guide', 'news']
    const counts = {}
    const categorized = {
      destination: [],
      itinerary: [],
      guide: [],
      news: []
    }

    for (const type of types) {
      const res = await userAPI.getAllLikes(type)
      if (res.code === 200) {
        const list = res.data.list || []
        counts[type] = list.length
        categorized[type] = list.filter(item => item.target)
      }
    }

    likeCounts.value = counts
    likeDestinations.value = categorized.destination
    likeItineraries.value = categorized.itinerary
    likeGuides.value = categorized.guide
    likeNews.value = categorized.news
  } catch (error) {
    console.error('加载分类点赞失败:', error)
  }
}

// 获取分类数量
const getInteractionCount = (countsObj, type) => {
  return countsObj[type] || 0
}

// 跳转函数
const goToDestination = (id) => {
  router.push('/')
  setTimeout(() => {
    window.dispatchEvent(new CustomEvent('view-destination', { detail: { id } }))
  }, 100)
}

const goToItinerary = (id) => {
  router.push(`/itinerary-detail?id=${id}`)
}

const goToGuide = (id) => {
  router.push(`/guide-detail?id=${id}`)
}

const goToNews = (id) => {
  router.push(`/news-detail?id=${id}`)
}

const loadReviews = async () => {
  try {
    const res = await userAPI.getUserReviews()
    if (res.code === 200) {
      reviews.value = res.data
    }
  } catch (error) {
    console.error('加载评论失败:', error)
  }
}

const deleteReview = async (id) => {
  if (!confirm('确定要删除这条评论吗？')) return
  
  try {
    const res = await userAPI.deleteReview(id)
    if (res.code === 200) {
      reviews.value = reviews.value.filter(r => r.id !== id)
    }
  } catch (error) {
    console.error('删除评论失败:', error)
  }
}

const saveProfile = async () => {
  saving.value = true
  try {
    const res = await userAPI.updateProfile(settingsForm.value)
    if (res.code === 200) {
      authStore.user = { ...authStore.user, ...settingsForm.value }
      localStorage.setItem('user', JSON.stringify(authStore.user))
      ElMessage.success('更新成功')
    }
  } catch (error) {
    console.error('更新资料失败:', error)
    ElMessage.error('更新失败')
  } finally {
    saving.value = false
  }
}

const changePassword = async () => {
  if (!passwordForm.value.oldPassword || !passwordForm.value.newPassword || !passwordForm.value.confirmPassword) {
    ElMessage.warning('请填写所有字段')
    return
  }
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    ElMessage.warning('两次输入的密码不一致')
    return
  }
  if (passwordForm.value.newPassword.length < 6) {
    ElMessage.warning('新密码至少需要6位')
    return
  }

  savingPassword.value = true
  try {
    const res = await userAPI.changePassword({
      oldPassword: passwordForm.value.oldPassword,
      newPassword: passwordForm.value.newPassword
    })
    if (res.code === 200) {
      ElMessage.success('密码修改成功')
      passwordForm.value = { oldPassword: '', newPassword: '', confirmPassword: '' }
    } else {
      ElMessage.error(res.message || '密码修改失败')
    }
  } catch (error) {
    console.error('修改密码失败:', error)
    ElMessage.error('密码修改失败，请检查原密码是否正确')
  } finally {
    savingPassword.value = false
  }
}

const loadNotifications = async () => {
  try {
    const res = await notificationAPI.getNotifications()
    if (res.code === 200) {
      notifications.value = res.data.notifications
      unreadCount.value = res.data.unreadCount
    }
  } catch (error) {
    console.error('加载通知失败:', error)
  }
}

const markAllRead = async () => {
  try {
    const res = await notificationAPI.markAsRead()
    if (res.code === 200) {
      notifications.value.forEach(n => n.isRead = true)
      unreadCount.value = 0
      ElMessage.success('已全部标为已读')
    }
  } catch (error) {
    console.error('标记已读失败:', error)
  }
}

const markNotificationRead = async (id) => {
  try {
    const res = await notificationAPI.markAsRead(id)
    if (res.code === 200) {
      const notification = notifications.value.find(n => n.id === id)
      if (notification && !notification.isRead) {
        notification.isRead = true
        unreadCount.value = Math.max(0, unreadCount.value - 1)
      }
    }
  } catch (error) {
    console.error('标记已读失败:', error)
  }
}

const deleteNotification = async (id) => {
  try {
    const res = await notificationAPI.deleteNotification(id)
    if (res.code === 200) {
      notifications.value = notifications.value.filter(n => n.id !== id)
      ElMessage.success('删除成功')
    }
  } catch (error) {
    console.error('删除通知失败:', error)
  }
}

const formatNotificationTime = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days === 0) {
    const hours = Math.floor(diff / (1000 * 60 * 60))
    if (hours === 0) {
      const minutes = Math.floor(diff / (1000 * 60))
      return minutes <= 0 ? '刚刚' : `${minutes}分钟前`
    }
    return `${hours}小时前`
  } else if (days === 1) {
    return '昨天'
  } else if (days < 7) {
    return `${days}天前`
  }
  return date.toLocaleDateString('zh-CN')
}

onMounted(() => {
  if (!authStore.isUserLoggedIn) {
    return
  }

  if (route.query.tab === 'notifications') {
    activeTab.value = 'notifications'
  } else if (route.query.tab === 'likes') {
    activeTab.value = 'likes'
  } else if (route.query.tab === 'reviews') {
    activeTab.value = 'reviews'
  } else if (route.query.tab === 'settings') {
    activeTab.value = 'settings'
  }

  settingsForm.value.nickname = authStore.user?.nickname || ''
  settingsForm.value.bio = authStore.user?.bio || ''

  loadFavorites()
  loadLikes()
  loadAllFavorites()
  loadAllLikes()
  loadReviews()
  loadNotifications()
})
</script>

<style scoped>
.profile-page {
  height: 100vh;
  background: #f5f5f5;
  overflow: hidden;
  padding-top: 70px;
}

.container {
  display: flex;
  height: 100%;
  overflow: hidden;
  margin-left: 260px;
}

.main-content {
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  width: 100%;
}

.scrollable-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

.login-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  width: 100%;
}

.tip-content {
  text-align: center;
  padding: 40px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.tip-icon {
  font-size: 64px;
  display: block;
  margin-bottom: 16px;
}

.tip-content h2 {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 12px 0;
}

.tip-content p {
  font-size: 14px;
  color: #64748b;
  margin: 0 0 24px 0;
}

.login-btn {
  padding: 12px 32px;
  background: #1e293b;
  color: white;
  border: none;
  border-radius: 25px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.login-btn:hover {
  background: #334155;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.profile-content {
  width: 100%;
}

.profile-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.profile-header {
  padding: 32px;
  display: flex;
  gap: 24px;
  border-bottom: 1px solid #f1f5f9;
  align-items: center;
}

.avatar-section {
  flex-shrink: 0;
}

.avatar-wrapper {
  position: relative;
  width: 100px;
  height: 100px;
  cursor: pointer;
}

.user-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #e2e8f0;
}

.user-avatar.default-avatar {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-text {
  color: white;
  font-size: 36px;
  font-weight: 600;
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
  color: white;
}

.avatar-wrapper:hover .avatar-overlay {
  opacity: 1;
}

.user-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.user-name {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.user-email {
  color: #64748b;
  font-size: 14px;
  margin: 0;
}

.user-bio {
  color: #475569;
  font-size: 14px;
  line-height: 1.5;
  margin: 4px 0 0 0;
  max-width: 500px;
}

.profile-tabs {
  display: flex;
  gap: 4px;
  padding: 12px 16px;
  background: #f8fafc;
  border-bottom: 1px solid #f1f5f9;
}

.tab-btn {
  flex: 1;
  padding: 12px 16px;
  background: transparent;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.tab-btn:hover {
  background: #f1f5f9;
  color: #1e293b;
}

.tab-btn.active {
  background: white;
  color: #6366f1;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.tab-content {
  padding: 32px;
  min-height: 400px;
  width: 100%;
  box-sizing: border-box;
}

.tab-panel {
  width: 100%;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #64748b;
}

.empty-state svg {
  color: #cbd5e1;
  margin-bottom: 16px;
}

.empty-state p {
  font-size: 16px;
  font-weight: 500;
  color: #475569;
  margin: 0 0 6px 0;
}

.empty-state span {
  font-size: 14px;
  color: #64748b;
}

.destinations-grid {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
  justify-items: stretch;
}

/* 交互标签页样式 */
.interaction-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  padding: 8px;
  background: #f8fafc;
  border-radius: 12px;
}

.interaction-tab {
  flex: 1;
  padding: 10px 16px;
  background: transparent;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.interaction-tab:hover {
  background: #f1f5f9;
  color: #1e293b;
}

.interaction-tab.active {
  background: white;
  color: #6366f1;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.interaction-tab .count {
  background: #e2e8f0;
  color: #64748b;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
}

.interaction-tab.active .count {
  background: #e0e7ff;
  color: #6366f1;
}

/* 通用卡片网格 */
.items-grid {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
  justify-items: stretch;
}

.item-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  cursor: pointer;
  transition: all 0.2s ease;
}

.item-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.itinerary-card {
  border-color: #bfdbfe;
}

.guide-card {
  border-color: #fef08a;
}

.news-card {
  border-color: #bbf7d0;
}

.card-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 4px 10px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.9);
  color: #1e293b;
}

.card-badge.official {
  background: linear-gradient(135deg, #ffd700, #ffaa00);
  color: white;
}

.card-badge.category {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
}

.card-meta {
  display: flex;
  gap: 12px;
  margin-bottom: 8px;
}

.card-meta .meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #64748b;
  font-size: 13px;
}

.card-author {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #64748b;
  font-size: 13px;
  margin-bottom: 8px;
}

.destination-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  cursor: pointer;
  transition: all 0.2s ease;
}

.destination-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.card-image {
  position: relative;
  height: 180px;
  overflow: hidden;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.destination-card:hover .card-image img {
  transform: scale(1.05);
}

.card-rating {
  position: absolute;
  top: 10px;
  right: 10px;
  background: white;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  color: #1e293b;
}

.card-content {
  padding: 16px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 8px 0;
}

.card-location {
  color: #64748b;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 8px;
}

.card-desc {
  color: #64748b;
  font-size: 13px;
  line-height: 1.5;
  margin: 0;
}

.reviews-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.review-card {
  width: 100%;
  background: #f8fafc;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e2e8f0;
  box-sizing: border-box;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.review-destination {
  display: flex;
  align-items: center;
  gap: 12px;
}

.destination-name {
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.review-rating {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  font-weight: 500;
  color: #1e293b;
}

.delete-btn {
  padding: 6px 12px;
  background: #fee2e2;
  color: #dc2626;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 4px;
}

.delete-btn:hover {
  background: #fecaca;
}

.review-content {
  color: #475569;
  font-size: 14px;
  line-height: 1.6;
  margin: 0 0 10px 0;
}

.review-date {
  color: #94a3b8;
  font-size: 13px;
  margin: 0;
}

.settings-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.settings-card {
  width: 100%;
  background: #f8fafc;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #e2e8f0;
  box-sizing: border-box;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 20px 0;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.form-group label {
  font-weight: 500;
  color: #334155;
  font-size: 14px;
}

.form-group input,
.form-group textarea {
  padding: 10px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s ease;
  background: white;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.save-btn {
  padding: 10px 24px;
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  align-self: flex-start;
}

.save-btn:hover:not(:disabled) {
  background: #4f46e5;
}

.save-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.save-btn.secondary {
  background: #475569;
}

.save-btn.secondary:hover:not(:disabled) {
  background: #334155;
}

.notification-badge {
  background: #ef4444;
  color: white;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 10px;
  margin-left: 4px;
}

.notifications-container {
  width: 100%;
}

.notifications-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
}

.mark-all-read {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #f1f5f9;
  color: #64748b;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.mark-all-read:hover {
  background: #e2e8f0;
  color: #475569;
}

.notifications-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid #e2e8f0;
}

.notification-item:hover {
  background: #f1f5f9;
}

.notification-item.unread {
  background: #f0f9ff;
  border-color: #bae6fd;
}

.notification-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  background: white;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-text {
  font-size: 14px;
  color: #334155;
  margin: 0 0 6px 0;
  line-height: 1.5;
}

.notification-time {
  font-size: 12px;
  color: #94a3b8;
}

.notification-delete {
  flex-shrink: 0;
  padding: 6px;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.2s ease;
}

.notification-delete:hover {
  background: #fee2e2;
  color: #dc2626;
}

.mt-4 {
  margin-top: 24px;
}

@media (max-width: 1200px) {
  .container {
    margin-left: 0;
  }
}

@media (max-width: 768px) {
  .profile-page {
    padding-top: 70px;
  }
  
  .container {
    flex-direction: column;
    margin-left: 0;
  }

  .main-content {
    padding: 12px;
  }

  .profile-header {
    flex-direction: column;
    text-align: center;
    padding: 24px 16px;
  }

  .avatar-wrapper {
    width: 80px;
    height: 80px;
  }

  .avatar-text {
    font-size: 28px;
  }

  .user-name {
    font-size: 20px;
  }

  .profile-tabs {
    flex-wrap: wrap;
  }

  .tab-btn {
    flex: 1 1 45%;
  }

  .tab-content {
    padding: 20px 16px;
  }

  .destinations-grid {
    grid-template-columns: 1fr;
  }

  .save-btn {
    align-self: stretch;
  }
}

@media (max-width: 768px) {
  .profile-page .container { margin-left: 0; }
  .profile-page .main-content { padding-bottom: 60px; }
  .profile-header { flex-direction: column; text-align: center; padding: 20px; }
  .profile-avatar { width: 80px; height: 80px; font-size: 32px; }
  .profile-info h1 { font-size: 22px; }
  .profile-stats { justify-content: center; }
  .tabs { overflow-x: auto; gap: 0; }
  .tab { white-space: nowrap; padding: 12px 16px; font-size: 13px; }
  .content-area { padding: 15px; }
}
</style>
