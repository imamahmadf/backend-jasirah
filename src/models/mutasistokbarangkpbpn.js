"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class mutasiStokBarangKpbpn extends Model {
    static associate(models) {
      this.belongsTo(models.barangJasaKpbpn, {
        foreignKey: "barangJasaKpbpnId",
      });
    }
  }

  mutasiStokBarangKpbpn.init(
    {
      jenis: DataTypes.ENUM("masuk", "keluar"),
      jumlah: DataTypes.DECIMAL(12, 3),
      keterangan: DataTypes.TEXT,
      barangJasaKpbpnId: DataTypes.INTEGER,
      pengajuanBarjasKpbpnId: DataTypes.INTEGER,
      itemPengajuanBarjasKpbpnId: DataTypes.INTEGER,
      userKPBPNId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "mutasiStokBarangKpbpn",
    },
  );

  return mutasiStokBarangKpbpn;
};
