"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class realisasiPJPL extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsToMany(models.kinerjaPJPL, {
        through: "realisasiKinerjaPJPLs",
        foreignKey: "realisasiPJPLId",
        as: "kinerjaPJPLs",
      });
      this.hasMany(models.hasilKerjaPJPL, {
        foreignKey: "realisasiPJPLId",
        as: "hasilKerjaPJPLs",
      });
      this.hasMany(models.hasilKerjaKualitatifPJPL, {
        foreignKey: "realisasiPJPLId",
      });
    }
  }
  realisasiPJPL.init(
    {
      tanggalAwal: DataTypes.DATE,
      tanggalAkhir: DataTypes.DATE,
      status: DataTypes.ENUM("diajukan", "ditolak", "diterima"),
    },
    {
      sequelize,
      modelName: "realisasiPJPL",
    },
  );
  return realisasiPJPL;
};
