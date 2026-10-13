"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class riwayatMitraSumur extends Model {
    static associate(models) {
      this.belongsTo(models.sumurMinyak, { foreignKey: "sumurMinyakId" });
      this.belongsTo(models.mitra, { foreignKey: "mitraId" });
    }
  }

  riwayatMitraSumur.init(
    {
      sumurMinyakId: DataTypes.INTEGER,
      mitraId: DataTypes.INTEGER,
      mulai: DataTypes.DATE,
      selesai: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "riwayatMitraSumur",
      tableName: "riwayatMitraSumurs",
    },
  );

  return riwayatMitraSumur;
};
