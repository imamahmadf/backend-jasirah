"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class produksiSumur extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.sumurMinyak, { foreignKey: "sumurMinyakId" });
      this.belongsTo(models.suratJalan, { foreignKey: "suratJalanId" });
      this.belongsTo(models.satuanVolume, { foreignKey: "satuanVolumeId" });
    }
  }
  produksiSumur.init(
    {
      produksi: DataTypes.INTEGER,
      sumurMinyakId: DataTypes.INTEGER,
      suratJalanId: DataTypes.INTEGER,
      satuanVolumeId: DataTypes.INTEGER,
      tanggal: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "produksiSumur",
    },
  );
  return produksiSumur;
};
