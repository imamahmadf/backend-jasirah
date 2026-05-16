'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class pajak extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  pajak.init({
    nopol: DataTypes.STRING,
    tg_pkb: DataTypes.STRING,
    tg_stnk: DataTypes.STRING,
    total: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'pajak',
  });
  return pajak;
};