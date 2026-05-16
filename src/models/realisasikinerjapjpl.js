"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class realisasiKinerjaPJPL extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.kinerjaPJPL, {
        foreignKey: "kinerjaPJPLId",
        as: "kinerjaPJPL",
      });
      this.belongsTo(models.realisasiPJPL, {
        foreignKey: "realisasiPJPLId",
        as: "realisasiPJPL",
      });
    }
  }
  realisasiKinerjaPJPL.init(
    {
      kinerjaPJPLId: DataTypes.INTEGER,
      realisasiPJPLId: DataTypes.INTEGER,
      hasil: DataTypes.INTEGER,
      nilai: DataTypes.INTEGER,
      status: DataTypes.ENUM("diajukan", "ditolak", "diterima"),
      buktiDukung: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "realisasiKinerjaPJPL",
      tableName: "realisasiKinerjaPJPLs",
    }
  );
  return realisasiKinerjaPJPL;
};
