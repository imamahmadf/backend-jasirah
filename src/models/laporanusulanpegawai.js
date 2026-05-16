"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class laporanUsulanPegawai extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  laporanUsulanPegawai.init(
    {
      tanggalAwal: DataTypes.DATE,
      tanggalAkhir: DataTypes.DATE,
      status: DataTypes.ENUM("Buka", "Tutup"),
    },
    {
      sequelize,
      modelName: "laporanUsulanPegawai",
    }
  );
  return laporanUsulanPegawai;
};
