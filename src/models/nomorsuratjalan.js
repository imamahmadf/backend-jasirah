'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class nomorSuratJalan extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  nomorSuratJalan.init({
    nomor: DataTypes.STRING,
    nomorUrut: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'nomorSuratJalan',
  });
  return nomorSuratJalan;
};