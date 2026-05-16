'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class templateKeuangan extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  templateKeuangan.init({
    nama: DataTypes.STRING,
    template: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'templateKeuangan',
  });
  return templateKeuangan;
};