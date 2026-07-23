const serverless = require('serverless-http');
const app = require('../../server/app');

const serverlessHandler = serverless(app);

exports.handler = async (event, context) => {
  // 等待数据库初始化完成再处理请求
  try {
    await app.dbReady();
  } catch (err) {
    console.error('数据库初始化失败:', err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ code: 500, message: '数据库初始化失败', error: err.message })
    };
  }
  return serverlessHandler(event, context);
};
