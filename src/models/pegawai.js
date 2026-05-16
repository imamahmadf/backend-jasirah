"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class pegawai extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.kontrakPJPL);
      this.hasMany(models.pejabatVerifikator);
      this.hasMany(models.personil);
      this.hasMany(models.riwayatPegawai);
      this.hasMany(models.profile);
      this.hasMany(models.usulanPegawai);
      this.hasMany(models.usulanNaikJenjang, {
        foreignKey: "pegawaiId",
        as: "usulanNaikJenjangs",
      });
      this.hasMany(models.kendaraan);
      this.hasMany(models.pengurusBarang);
      this.hasMany(models.mutasiKendaraan, {
        foreignKey: "pegawaiId",
        as: "pegawaiTujuan",
      });

      this.hasMany(models.mutasiKendaraan, {
        foreignKey: "asalPegawaiId",
        as: "pegawaiAsal",
      });
      this.belongsTo(models.daftarTingkatan, {
        foreignKey: "tingkatanId",
        as: "daftarTingkatan",
      });
      this.belongsTo(models.daftarPangkat, {
        foreignKey: "pangkatId",
        as: "daftarPangkat",
      });
      this.belongsTo(models.daftarGolongan, {
        foreignKey: "golonganId",
        as: "daftarGolongan",
      });
      this.belongsTo(models.statusPegawai, {
        foreignKey: "statusPegawaiId",
        as: "statusPegawai",
      });
      this.belongsTo(models.profesi, {
        foreignKey: "profesiId",
        as: "profesi",
      });
      this.belongsTo(models.daftarUnitKerja, {
        foreignKey: "unitKerjaId",
        as: "daftarUnitKerja",
      });
      this.hasMany(models.ttdSuratTugas, {
        foreignKey: "pegawaiId",
        as: "pegawai",
      });
      this.hasMany(models.ttdNotaDinas, {
        foreignKey: "pegawaiId",
        as: "pegawai_notaDinas",
      });
      this.hasMany(models.PPTK, {
        foreignKey: "pegawaiId",
        as: "pegawai_PPTK",
      });
      this.hasMany(models.KPA, {
        foreignKey: "pegawaiId",
        as: "pegawai_KPA",
      });
      this.hasMany(models.bendahara, {
        foreignKey: "pegawaiId",
        as: "pegawai_bendahara",
      });
      this.hasMany(models.kwitGlobal, {
        foreignKey: "pegawaiId",
      });
      this.hasMany(models.suratKeluar, {
        foreignKey: "pegawaiId",
        as: "suratKeluars",
      });
    }
  }
  pegawai.init(
    {
      nama: DataTypes.STRING,
      nip: DataTypes.STRING,
      nik: DataTypes.STRING,
      pendidikan: DataTypes.STRING,
      tingkatanId: DataTypes.INTEGER,
      pangkatId: DataTypes.INTEGER,
      golonganId: DataTypes.INTEGER,
      jabatan: DataTypes.STRING,
      nomorRekening: DataTypes.STRING,
      unitKerjaId: DataTypes.INTEGER,
      statusPegawaiId: DataTypes.INTEGER,
      profesiId: DataTypes.INTEGER,
      tanggalTMT: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "pegawai",
    }
  );
  return pegawai;
};
