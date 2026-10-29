"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class pengajuanBarjasKpbpn extends Model {
    static associate(models) {
      this.belongsTo(models.statusPengajuanKpbpn, {
        foreignKey: "statusPengajuanKpbpnId",
      });
      this.belongsTo(models.userKPBPN, { foreignKey: "pemohonId" });
      this.belongsTo(models.userKPBPN, {
        foreignKey: "mengetahuiId",
        as: "mengetahui",
      });
      this.belongsTo(models.userKPBPN, {
        foreignKey: "menyetujuiId",
        as: "menyetujui",
      });
      this.hasMany(models.itemPengajuanBarjasKpbpn, {
        foreignKey: "pengajuanBarjasKpbpnId",
      });
    }
  }

  pengajuanBarjasKpbpn.init(
    {
      nomor: DataTypes.STRING,
      tanggal: DataTypes.DATEONLY,
      level: DataTypes.ENUM("normal", "urgent"),
      jenis: DataTypes.ENUM("barang", "jasa"),
      keperluan: DataTypes.TEXT,
      catatan: DataTypes.TEXT,
      tanggalDibutuhkan: DataTypes.DATEONLY,
      lokasi: DataTypes.STRING,
      alasanPenolakan: DataTypes.TEXT,
      statusPengajuanKpbpnId: DataTypes.INTEGER,
      pemohonId: DataTypes.INTEGER,
      mengetahuiId: DataTypes.INTEGER,
      menyetujuiId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "pengajuanBarjasKpbpn",
    },
  );

  return pengajuanBarjasKpbpn;
};
