"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class sumurMinyak extends Model {
    static associate(models) {
      this.belongsTo(models.mitra, { foreignKey: "mitraId" });
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
      longitude: DataTypes.DECIMAL,
      latitude: DataTypes.DECIMAL,
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
