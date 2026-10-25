"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class nomorUrutSuratJalanAsal extends Model {
    static associate(models) {
      this.belongsTo(models.mitra, { foreignKey: "mitraId" });
      this.belongsTo(models.asalMinyak, { foreignKey: "asalMinyakId" });
    }
  }

  nomorUrutSuratJalanAsal.init(
    {
      mitraId: DataTypes.INTEGER,
      asalMinyakId: DataTypes.INTEGER,
      nomorUrut: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "nomorUrutSuratJalanAsal",
      tableName: "nomorUrutSuratJalanAsals",
    },
  );

  return nomorUrutSuratJalanAsal;
};
