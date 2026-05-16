"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class kwitGlobal extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Relasi ke pegawai, KPA, dan bendahara
      this.belongsTo(models.pegawai, {
        foreignKey: "pegawaiId",
        as: "pegawai",
      });
      this.belongsTo(models.KPA, {
        foreignKey: "KPAId",
        as: "KPA",
      });
      this.belongsTo(models.PPTK, {
        foreignKey: "PPTKId",
        as: "PPTK",
      });
      this.belongsTo(models.bendahara, {
        foreignKey: "bendaharaId",
        as: "bendahara",
      });
      this.belongsTo(models.daftarUnitKerja, {
        foreignKey: "unitKerjaId",
        as: "unitKerja",
      });
      this.belongsTo(models.daftarSubKegiatan, {
        foreignKey: "subKegiatanId",
        as: "subKegiatan",
      });

      this.belongsTo(models.templateKwitGlobal);
      this.belongsTo(models.jenisPerjalanan);

      // Relasi ke perjalanan (satu kwitGlobal bisa dipakai banyak perjalanan)
      this.hasMany(models.perjalanan, {
        foreignKey: "kwitGlobalId",
      });
    }
  }
  kwitGlobal.init(
    {
      pegawaiId: DataTypes.INTEGER,
      KPAId: DataTypes.INTEGER,
      bendaharaId: DataTypes.INTEGER,
      templateKwitGlobalId: DataTypes.INTEGER,
      jenisPerjalananId: DataTypes.INTEGER,
      unitKerjaId: DataTypes.INTEGER,
      subKegiatanId: DataTypes.INTEGER,
      status: DataTypes.ENUM("dibuat", "diajukan", "ditolak", "diterima"),
      verifikasi: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "kwitGlobal",
    }
  );
  return kwitGlobal;
};
