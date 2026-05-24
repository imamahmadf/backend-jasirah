"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class riwayatPegawai extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      // Relasi dengan pegawai (pemilik riwayat)
      this.belongsTo(models.pegawai, {
        foreignKey: "pegawaiId",
        as: "pegawai",
      });

      // Relasi dengan unit kerja lama
      this.belongsTo(models.daftarUnitKerja, {
        foreignKey: "unitKerjaLamaId",
        as: "unitKerjaLama",
      });

      // Relasi dengan profesi lama
      this.belongsTo(models.profesi, {
        foreignKey: "profesiLamaId",
        as: "profesiLama",
      });
    }
  }
  riwayatPegawai.init(
    {
      pegawaiId: DataTypes.INTEGER,
      tanggal: DataTypes.DATE,
      keterangan: DataTypes.STRING,
      unitKerjaLamaId: DataTypes.INTEGER,

      profesiLamaId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "riwayatPegawai",
    },
  );
  return riwayatPegawai;
};
