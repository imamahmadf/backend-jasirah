'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class transportir extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.hasMany(models.suratJalan, { foreignKey: "transportirId" });
    }
  }
  transportir.init({
    plat: DataTypes.STRING,
    foto: DataTypes.STRING,
    supirId: DataTypes.INTEGER,
    kapasitas: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'transportir',
  });
  return transportir;
};