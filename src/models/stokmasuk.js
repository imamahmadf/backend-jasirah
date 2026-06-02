"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class stokMasuk extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.daftarUnitKerja, {
        foreignKey: "unitKerjaId",
      });
      this.belongsTo(models.persediaan);
      this.belongsTo(models.pengeluaran);
      this.hasMany(models.stokKeluar);
      this.belongsTo(models.laporanPersediaan);
      this.belongsTo(models.sumberDana);
      this.belongsTo(models.suratPesanan);
      this.belongsTo(models.satuanPersediaan);
      this.belongsTo(models.mutasiPersediaan);
      this.belongsTo(models.stokMasuk, {
        foreignKey: "stokMasukAsalId",
        as: "stokMasukAsal",
      });
      this.hasMany(models.stokMasuk, {
        foreignKey: "stokMasukAsalId",
        as: "stokMasukHasMutasi",
      });
    }
  }
  stokMasuk.init(
    {
      unitKerjaId: DataTypes.INTEGER,
      persediaanId: DataTypes.INTEGER,
      jumlah: DataTypes.INTEGER,
      hargaSatuan: DataTypes.INTEGER,
      keterangan: DataTypes.STRING,
      tanggal: DataTypes.DATE,
      spesifikasi: DataTypes.STRING,
      laporanPersediaanId: DataTypes.INTEGER,
      sumberDanaId: DataTypes.INTEGER,
      suratPesananId: DataTypes.INTEGER,
      nomorPesanan: DataTypes.INTEGER,
      satuanPersediaanId: DataTypes.INTEGER,
      foto: DataTypes.STRING,
      mutasiPersediaanId: DataTypes.INTEGER,
      stokMasukAsalId: DataTypes.INTEGER,
      pengeluaranId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "stokMasuk",
    },
  );
  return stokMasuk;
};
