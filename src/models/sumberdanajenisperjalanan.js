"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class sumberDanaJenisPerjalanan extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.jenisPerjalanan);
      this.belongsTo(models.sumberDana);
    }
  }
  sumberDanaJenisPerjalanan.init(
    {
      sumberDanaId: DataTypes.INTEGER,
      jenisPerjalananId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "sumberDanaJenisPerjalanan",
    }
  );
  return sumberDanaJenisPerjalanan;
};
