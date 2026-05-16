"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class laporanPersediaan extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.stokMasuk);
      this.hasMany(models.stokKeluar);
    }
  }
  laporanPersediaan.init(
    {
      nama: DataTypes.STRING,
      status: DataTypes.ENUM("buka", "tutup"),
      tanggalAwal: DataTypes.DATE,
      tanggalAkhir: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "laporanPersediaan",
    }
  );
  return laporanPersediaan;
};
