"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class bangunan extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.indukUnitKerja);
      this.belongsTo(models.jenisBangunan);
      this.belongsTo(models.kondisiBangunan);
      this.hasMany(models.penghuni);
      this.hasMany(models.rehapBangunan);
    }
  }
  bangunan.init(
    {
      indukUnitKerjaId: DataTypes.INTEGER,
      nama: DataTypes.STRING,
      alamat: DataTypes.STRING,
      jenisBangunanId: DataTypes.INTEGER,
      luasTanah: DataTypes.INTEGER,
      luasBangunan: DataTypes.INTEGER,
      tahunPembangunan: DataTypes.INTEGER,
      kondisiBangunanId: DataTypes.INTEGER,
      EBMD: DataTypes.STRING,
      sertifikasiTanah: DataTypes.ENUM("ya", "tidak"),
      kepemilikanTanah: DataTypes.ENUM("ya", "tidak"),
    },
    {
      sequelize,
      modelName: "bangunan",
    }
  );
  return bangunan;
};
