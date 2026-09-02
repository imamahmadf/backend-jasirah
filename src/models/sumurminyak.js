"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class sumurMinyak extends Model {
    static associate(models) {
      this.belongsTo(models.mitra, { foreignKey: "mitraId" });
      this.hasMany(models.produksiSumur, { foreignKey: "sumurMinyakId" });
    }
  }
  sumurMinyak.init(
    {
      nama: DataTypes.STRING,
      mitraId: DataTypes.INTEGER,
      foto: DataTypes.STRING,
      nomor: DataTypes.STRING,
      statusVerifikasi: DataTypes.ENUM("sudah", "belum", "tidak"),
      tanggalVerifikasi: DataTypes.DATE,
      longitude: DataTypes.DECIMAL(11, 8),
      latitude: DataTypes.DECIMAL(11, 8),
      alamat: DataTypes.STRING,
      produksiHarian: DataTypes.DECIMAL,
    },
    {
      sequelize,
      modelName: "sumurMinyak",
    },
  );
  return sumurMinyak;
};
