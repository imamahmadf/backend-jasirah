"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class mutasiPersediaan extends Model {
    static associate(models) {
      this.belongsTo(models.stokMasuk, {
        foreignKey: "stokMasukAsalId",
        as: "stokMasukAsal",
      });
      this.belongsTo(models.stokMasuk, {
        foreignKey: "stokMasukTujuanId",
        as: "stokMasukTujuan",
      });
      this.belongsTo(models.daftarUnitKerja, {
        foreignKey: "unitKerjaAsalId",
        as: "unitKerjaAsal",
      });
      this.belongsTo(models.daftarUnitKerja, {
        foreignKey: "unitKerjaTujuanId",
        as: "unitKerjaTujuan",
      });
      this.hasMany(models.stokMasuk, {
        foreignKey: "mutasiPersediaanId",
      });
    }
  }
  mutasiPersediaan.init(
    {
      stokMasukAsalId: DataTypes.INTEGER,
      stokMasukTujuanId: DataTypes.INTEGER,
      unitKerjaAsalId: DataTypes.INTEGER,
      unitKerjaTujuanId: DataTypes.INTEGER,
      jumlah: DataTypes.INTEGER,
      tanggal: DataTypes.DATE,
      keterangan: DataTypes.STRING,
      status: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "mutasiPersediaan",
    }
  );
  return mutasiPersediaan;
};
