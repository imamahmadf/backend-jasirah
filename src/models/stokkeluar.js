"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class stokKeluar extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.stokMasuk);
      this.belongsTo(models.laporanPersediaan);
    }
  }
  stokKeluar.init(
    {
      stokMasukId: DataTypes.INTEGER,
      jumlah: DataTypes.INTEGER,
      tanggal: DataTypes.DATE,
      tujuan: DataTypes.STRING,
      keterangan: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "stokKeluar",
    },
  );
  return stokKeluar;
};
