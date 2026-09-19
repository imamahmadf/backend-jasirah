"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class produksiSumurK3S extends Model {
    static associate(models) {
      this.belongsTo(models.sumurMinyak, { foreignKey: "sumurMinyakId" });
      this.belongsTo(models.BAK3S, { foreignKey: "BAK3SId" });
      this.belongsTo(models.satuanVolume, { foreignKey: "satuanVolumeId" });
    }
  }
  produksiSumurK3S.init(
    {
      produksi: DataTypes.DECIMAL(10, 3),
      sumurMinyakId: DataTypes.INTEGER,
      BAK3SId: DataTypes.INTEGER,
      satuanVolumeId: DataTypes.INTEGER,
      tanggal: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "produksiSumurK3S",
      tableName: "produksiSumurK3S",
    },
  );
  return produksiSumurK3S;
};
