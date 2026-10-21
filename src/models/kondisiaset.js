"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class kondisiAset extends Model {
    static associate(models) {
      this.hasMany(models.aset, { foreignKey: "kondisiAsetId" });
    }
  }
  kondisiAset.init(
    {
      nama: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "kondisiAset",
    },
  );
  return kondisiAset;
};
