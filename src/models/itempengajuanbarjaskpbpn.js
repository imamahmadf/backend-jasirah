"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class itemPengajuanBarjasKpbpn extends Model {
    static associate(models) {
      this.belongsTo(models.pengajuanBarjasKpbpn, {
        foreignKey: "pengajuanBarjasKpbpnId",
      });
      this.belongsTo(models.barangJasaKpbpn, {
        foreignKey: "barangJasaKpbpnId",
      });
    }
  }

  itemPengajuanBarjasKpbpn.init(
    {
      nama: DataTypes.STRING,
      spesifikasi: DataTypes.TEXT,
      jumlah: DataTypes.DECIMAL(12, 3),
      satuan: DataTypes.STRING,
      keterangan: DataTypes.TEXT,
      foto: DataTypes.STRING,
      estimasiHarga: DataTypes.BIGINT,
      hargaAktual: DataTypes.BIGINT,
      pengajuanBarjasKpbpnId: DataTypes.INTEGER,
      barangJasaKpbpnId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "itemPengajuanBarjasKpbpn",
    },
  );

  return itemPengajuanBarjasKpbpn;
};
