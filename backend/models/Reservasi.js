const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Reservasi = sequelize.define('Reservasi', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  tanggal: { type: DataTypes.DATEONLY, allowNull: false },
  jam_mulai: { type: DataTypes.TIME, allowNull: false },
  jam_selesai: { type: DataTypes.TIME, allowNull: false },
  status: { type: DataTypes.ENUM('pending', 'dikonfirmasi', 'dibatalkan'), defaultValue: 'pending' },
  catatan: { type: DataTypes.TEXT }
}, { tableName: 'reservasis', underscored: true });

module.exports = Reservasi;