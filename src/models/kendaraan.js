"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class kendaraan extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.daftarUnitKerja, {
        foreignKey: "unitKerjaId",
        as: "kendaraanUK",
      });
      this.belongsTo(models.pegawai);
      this.belongsTo(models.kondisi);
      this.belongsTo(models.jenisKendaraan);
      this.belongsTo(models.statusKendaraan);
      this.hasMany(models.suratPengantar);
      this.hasMany(models.mutasiKendaraan);
      this.hasMany(models.kendaraanDinas);
    }
  }
  kendaraan.init(
    {
      unitKerjaId: DataTypes.INTEGER,
      pegawaiId: DataTypes.INTEGER,
      noKontak: DataTypes.BIGINT,
      nomor: DataTypes.INTEGER,
      seri: DataTypes.STRING,
      noRangka: DataTypes.STRING,
      noMesin: DataTypes.STRING,
      tgl_pkb: DataTypes.STRING,
      tg_stnk: DataTypes.STRING,
      total: DataTypes.BIGINT,
      kondisiId: DataTypes.INTEGER,
      jenisKendaraanId: DataTypes.INTEGER,
      statusKendaraanId: DataTypes.INTEGER,
      foto: DataTypes.STRING,
      warna: DataTypes.STRING,
      merek: DataTypes.STRING,
      tanggalPerolehan: DataTypes.DATE,
      nilaiPerolehan: DataTypes.BIGINT,
      nibar: DataTypes.TEXT,
      link: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "kendaraan",
    }
  );
  return kendaraan;
};
