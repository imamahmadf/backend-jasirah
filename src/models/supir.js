'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class supir extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.mitra, { foreignKey: "mitraId" });
      this.hasMany(models.suratJalan, { foreignKey: "supirId" });
    }
  }
  supir.init({
    nama: DataTypes.STRING,
    nik: DataTypes.STRING,
    ktp: DataTypes.STRING,
    foto: DataTypes.STRING,
    mitraId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'supir',
  });
  return supir;
};