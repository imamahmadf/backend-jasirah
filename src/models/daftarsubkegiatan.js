"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class daftarSubKegiatan extends Model {
    static associate(models) {
      this.hasMany(models.perjalanan, {
        foreignKey: "subKegiatanId",
      });
      this.hasMany(models.anggaran, {
        foreignKey: "subKegiatanId",
      });
      this.hasMany(models.kwitGlobal, {
        foreignKey: "subKegiatanId",
      });

      this.belongsTo(models.daftarUnitKerja, {
        foreignKey: "unitKerjaId",
      });
    }
  }
  daftarSubKegiatan.init(
    {
      kodeRekening: DataTypes.STRING,
      anggaran: DataTypes.INTEGER,
      subKegiatan: DataTypes.STRING,
      unitKerjaId: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "daftarSubKegiatan",
    }
  );
  return daftarSubKegiatan;
};
