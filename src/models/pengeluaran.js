"use strict";
const { Model, STRING } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class pembelian extends Model {
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
      this.belongsTo(models.indukUnitKerja);
      this.belongsTo(models.metodePembayaran);
      this.belongsTo(models.jenisPengeluaran);
      this.belongsTo(models.statusPembayaran);
      this.belongsTo(models.pegawai);
      this.hasMany(models.stokMasuk);
      this.belongsTo(models.rekanan);
    }
  }
  pembelian.init(
    {
      tanggal: DataTypes.DATE,
      deskripsi: DataTypes.STRING,
      unitKerjaId: DataTypes.INTEGER,
      indukUnitKerjaId: DataTypes.INTEGER,
      metodePembayaranId: DataTypes.INTEGER,
      jenisPengeluaranId: DataTypes.INTEGER,
      nominal: DataTypes.INTEGER,
      pegawaiId: DataTypes.INTEGER,
      statusPembayaranId: DataTypes.INTEGER,
      foto: DataTypes.STRING,
      jatuhTempo: DataTypes.STRING,
      rekananId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "pengeluaran",
    },
  );
  return pembelian;
};
