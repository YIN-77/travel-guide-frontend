const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false,
    pool: {
      max: 2,
      min: 1,
      acquire: 15000,
      idle: 30000,
      evict: 10000
    },
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      },
      connectTimeout: 10000,
      keepAlive: true
    },
    retry: {
      max: 3
    }
  }
);

module.exports = sequelize;