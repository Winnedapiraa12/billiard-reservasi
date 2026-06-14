const sequelize = require('../config/database');
const User = require('./User');
const Meja = require('./Meja');
const Reservasi = require('./Reservasi');

// Relasi Database
User.hasMany(Reservasi, { foreignKey: 'user_id' });
Reservasi.belongsTo(User, { foreignKey: 'user_id' });

Meja.hasMany(Reservasi, { foreignKey: 'meja_id' });
Reservasi.belongsTo(Meja, { foreignKey: 'meja_id' });

module.exports = { sequelize, User, Meja, Reservasi };