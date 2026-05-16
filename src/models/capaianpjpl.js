'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class capaianPJPL extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  capaianPJPL.init({
    buktiDukung: DataTypes.STRING,
    nilai: DataTypes.INTEGER,
    capaian: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'capaianPJPL',
  });
  return capaianPJPL;
};