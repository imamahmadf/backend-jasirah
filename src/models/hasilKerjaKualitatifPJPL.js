"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class hasilKerjaKualitatifPJPL extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      hasilKerjaKualitatifPJPL.belongsTo(models.kualitatifPJPL, {
        foreignKey: "kualitatifPJPLId",
      });
      hasilKerjaKualitatifPJPL.belongsTo(models.realisasiPJPL, {
        foreignKey: "realisasiPJPLId",
      });
      hasilKerjaKualitatifPJPL.belongsTo(models.pejabatVerifikator, {
        foreignKey: "pejabatVerifikatorId",
      });
    }
  }
  hasilKerjaKualitatifPJPL.init(
    {
      tanggalAwal: DataTypes.DATE,
      tanggalAkhir: DataTypes.DATE,
      nilai: DataTypes.INTEGER,
      catatan: DataTypes.STRING,
      kualitatifPJPLId: DataTypes.INTEGER,
      realisasiPJPLId: DataTypes.INTEGER,
      pejabatVerifikatorId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "hasilKerjaKualitatifPJPL",
    },
  );
  return hasilKerjaKualitatifPJPL;
};
