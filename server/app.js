const express = require('express');
const cors = require('cors');
const app = express();

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
let dbInitialized = false;
const initDB = async () => {
  if (dbInitialized) return;
  try {
    const { sequelize } = require('./models');
    await sequelize.authenticate();
    console.log('数据库连接成功');
    await sequelize.sync({ force: false });
    console.log('数据库表同步成功');
    dbInitialized = true;
  } catch (error) {
    console.error('数据库连接失败:', error.message);
  }
};
initDB();

module.exports = app;
