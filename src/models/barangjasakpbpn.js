"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class barangJasaKpbpn extends Model {
    static associate(models) {
      this.hasMany(models.itemPengajuanBarjasKpbpn, {
        foreignKey: "barangJasaKpbpnId",
      });
      this.hasMany(models.mutasiStokBarangKpbpn, {
        foreignKey: "barangJasaKpbpnId",
      });
    }
  }

  barangJasaKpbpn.init(
    {
      nama: DataTypes.STRING,
      jenis: DataTypes.ENUM("barang", "jasa"),
      satuan: DataTypes.STRING,
      spesifikasi: DataTypes.TEXT,
      stok: {
        type: DataTypes.DECIMAL(12, 3),
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: "barangJasaKpbpn",
    },
  );

  return barangJasaKpbpn;
};
