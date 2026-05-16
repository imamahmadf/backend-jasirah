'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class uangPelayanan extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  uangPelayanan.init({
    uangTransport: DataTypes.INTEGER,
    jenis: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'uangPelayanan',
  });
  return uangPelayanan;
};