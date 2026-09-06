'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class asalMinyak extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.hasMany(models.suratJalan, {
        foreignKey: "asalMinyakId",
        as: "suratJalans",
      });
    }
  }
  asalMinyak.init({
    nomor: DataTypes.STRING,
    asal: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'asalMinyak',
  });
  return asalMinyak;
};