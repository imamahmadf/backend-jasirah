"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class perjalanan extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.hasMany(models.tempat);
      this.belongsTo(models.kendaraanDinas, {
        foreignKey: "kendaraanDinasId",
      });
      this.belongsTo(models.daftarSubKegiatan, {
        foreignKey: "subKegiatanId",
      });
      this.belongsTo(models.ttdSuratTugas, {
        foreignKey: "ttdSuratTugasId",
      });
      this.belongsTo(models.ttdNotaDinas, {
        foreignKey: "ttdNotaDinasId",
      });
      this.belongsTo(models.PPTK, {
        foreignKey: "PPTKId",
      });
      this.belongsTo(models.KPA, {
        foreignKey: "KPAId",
      });
      this.belongsTo(models.suratKeluar, {
        foreignKey: "nomorSuratKeluarId",
      });
      this.belongsTo(models.bendahara, {
        foreignKey: "bendaharaId",
      });
      this.belongsTo(models.kwitGlobal, {
        foreignKey: "kwitGlobalId",
      });
      this.belongsTo(models.jenisPerjalanan, {
        foreignKey: "jenisId",
      });
      this.belongsTo(models.pelayananKesehatan, {
        foreignKey: "pelayananKesehatanId",
      });
      this.hasMany(models.personil);
      this.hasMany(models.fotoPerjalanan);
    }
  }
  perjalanan.init(
    {
      untuk: DataTypes.STRING,
      asal: DataTypes.STRING,
      nomorSuratKeluarId: DataTypes.INTEGER,
      noNotaDinas: DataTypes.STRING,
      dasar: DataTypes.STRING,
      pic: DataTypes.STRING,
      noSuratTugas: DataTypes.STRING,
      tanggalPengajuan: DataTypes.DATE,
      ttdSuratTugasId: DataTypes.INTEGER,
      pelayananKesehatanId: DataTypes.INTEGER,
      ttdNotaDinasId: DataTypes.INTEGER,
      bendaharaId: DataTypes.INTEGER,
      PPTKId: DataTypes.INTEGER,
      nomorSuratKeluarId: DataTypes.INTEGER,
      KPAId: DataTypes.INTEGER,
      jenisId: DataTypes.INTEGER,
      subKegiatanId: DataTypes.INTEGER,
      tipeSrikandi: DataTypes.INTEGER,
      isNotaDinas: DataTypes.INTEGER,
      undangan: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "perjalanan",
    }
  );
  return perjalanan;
};
