const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

// 中间件
app.use(cors({
  origin: ['https://traval-guide-inone.netlify.app', 'http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 请求超时中间件
app.use((req, res, next) => {
  const timer = setTimeout(() => {
    if (!res.headersSent) {
      res.status(504).json({ code: 504, message: '请求超时，请重试', data: null });
    }
  }, 25000); // Netlify Functions 限制 26 秒
  res.on('finish', () => clearTimeout(timer));
  next();
});

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 健康检查端点（不依赖数据库）
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API 路由
const routes = require('./routes');
app.use('/api', routes);

// Multer 错误处理
app.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    if (req.path.includes('video')) {
      return res.status(400).json({
        code: 400,
        message: '视频大小不能超过 100MB',
        data: null
      });
    }
    return res.status(400).json({
      code: 400,
      message: '文件大小不能超过 5MB',
      data: null
    });
  }
  if (err.message && err.message.includes('只支持')) {
    return res.status(400).json({
      code: 400,
      message: err.message,
      data: null
    });
  }
  next(err);
});

// 错误处理
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

// 初始化数据库（仅冷启动时执行一次）
let dbInitPromise = null;
const initDB = async () => {
  try {
    const { sequelize } = require('./models');
    await sequelize.authenticate();
    console.log('数据库连接成功');
    await sequelize.sync({ force: false });
    console.log('数据库表同步成功');
  } catch (error) {
    console.error('数据库连接失败:', error.message);
    throw error;
  }
};

// 导出 app 和 db 初始化 Promise
app.dbReady = () => {
  if (!dbInitPromise) {
    dbInitPromise = initDB();
  }
  return dbInitPromise;
};

module.exports = app;
