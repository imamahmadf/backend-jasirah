"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class stasiunPengumpulMinyak extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.hasMany(models.tanki, {
        foreignKey: "stasiunPengumpulMinyakId",
        as: "tankis",
      });
      this.hasMany(models.suratJalan, {
        foreignKey: "stasiunPengumpulMinyakId",
        as: "suratJalans",
      });
    }
  }
  stasiunPengumpulMinyak.init(
    {
      nama: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "stasiunPengumpulMinyak",
    },
  );
  return stasiunPengumpulMinyak;
};
