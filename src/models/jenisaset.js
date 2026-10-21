"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class jenisAset extends Model {
    static associate(models) {
      this.hasMany(models.aset, { foreignKey: "jenisAsetId" });
    }
  }
  jenisAset.init(
    {
      nama: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "jenisAset",
    },
  );
  return jenisAset;
};
