"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class usulanPegawai extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.pegawai);
    }
  }
  usulanPegawai.init(
    {
      pegawaiId: DataTypes.INTEGER,
      dokumen: DataTypes.STRING,
      status: DataTypes.INTEGER,
      formulirUsulan: DataTypes.STRING,
      skCpns: DataTypes.STRING,
      skPns: DataTypes.STRING,
      PAK: DataTypes.STRING,
      skJafung: DataTypes.STRING,
      skp: DataTypes.STRING,
      skMutasi: DataTypes.STRING,
      STR: DataTypes.STRING,
      suratCuti: DataTypes.STRING,
      gelar: DataTypes.STRING,
      catatan: DataTypes.TEXT,
      nomorUsulan: DataTypes.STRING,
      laporanUsulanPegawaiId: DataTypes.INTEGER,
      linkSertifikat: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "usulanPegawai",
    }
  );
  return usulanPegawai;
};

// 0:diajukan
// 1 :ditolak
// 2:diterima
