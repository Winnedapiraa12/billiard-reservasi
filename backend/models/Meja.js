const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Meja = sequelize.define('Meja', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  nomor_meja: { type: DataTypes.STRING(10), allowNull: false },
  deskripsi: { type: DataTypes.TEXT },
  harga_per_jam: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  status: { type: DataTypes.ENUM('tersedia', 'digunakan', 'dipesan'), defaultValue: 'tersedia' }
}, { tableName: 'mejas', underscored: true });

module.exports = Meja;