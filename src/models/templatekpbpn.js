"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class templateKPBPN extends Model {
    static associate(models) {
      // define association here
    }
  }
  templateKPBPN.init(
    {
      nama: DataTypes.STRING,
      jenisDokumen: DataTypes.ENUM("BAST", "BAPenerimaan", "suratJalan"),
      template: DataTypes.STRING,
      status: DataTypes.ENUM("aktif", "nonaktif"),
    },
    {
      sequelize,
      modelName: "templateKPBPN",
    },
  );
  return templateKPBPN;
};
