"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class aset extends Model {
    static associate(models) {
      this.belongsTo(models.pengeluaran, { foreignKey: "pengeluaranId" });
      this.belongsTo(models.jenisAset, { foreignKey: "jenisAsetId" });
      this.belongsTo(models.kondisiAset, { foreignKey: "kondisiAsetId" });
      this.belongsTo(models.pegawai, {
        foreignKey: "penanggungjawabId",
        as: "penanggungJawab",
      });
      this.belongsTo(models.daftarUnitKerja, { foreignKey: "unitKerjaId" });
      this.hasMany(models.mutasiAset, { foreignKey: "asetId" });
    }
  }
  aset.init(
    {
      nama: DataTypes.STRING,
      kode: DataTypes.STRING,
      pengeluaranId: DataTypes.INTEGER,
      harga: DataTypes.INTEGER,
      jenisAsetId: DataTypes.INTEGER,
      tanggal: DataTypes.DATE,
      foto: DataTypes.STRING,
      kondisiAsetId: DataTypes.INTEGER,
      merek: DataTypes.STRING,
      spesifikasi: DataTypes.TEXT,
      penanggungjawabId: DataTypes.INTEGER,
      unitKerjaId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "aset",
    },
  );
  return aset;
};
