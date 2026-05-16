"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class kinerjaPJPL extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.kontrakPJPL, {
        foreignKey: "kontrakPJPLId",
        as: "kontrakPJPL",
      });
      this.belongsTo(models.indikatorPejabat, {
        foreignKey: "indikatorPejabatId",
        as: "indikatorPejabat",
      });
      this.belongsToMany(models.realisasiPJPL, {
        through: "realisasiKinerjaPJPLs",
        foreignKey: "kinerjaPJPLId",
        as: "realisasiPJPLs",
      });
    }
  }
  kinerjaPJPL.init(
    {
      kontrakPJPLId: DataTypes.INTEGER,
      indikatorPejabatId: DataTypes.INTEGER,
      indikator: DataTypes.TEXT,
      target: DataTypes.INTEGER,
      status: DataTypes.ENUM("diajukan", "ditolak", "diterima"),
      satuan: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "kinerjaPJPL",
    }
  );
  return kinerjaPJPL;
};
