"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class jenisPerjalanan extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.hasMany(models.perjalanan);
      this.hasMany(models.kwitGlobal);
      this.belongsTo(models.tipePerjalanan);
      // this.hasMany(models.jenisTipePerjalanan);
      this.hasMany(models.sumberDanaJenisPerjalanan);
    }
  }
  jenisPerjalanan.init(
    {
      jenis: DataTypes.STRING,
      kodeRekening: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "jenisPerjalanan",
    }
  );
  return jenisPerjalanan;
};
