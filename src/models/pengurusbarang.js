"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class pengurusBarang extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.pegawai);
      this.belongsTo(models.indukUnitKerja);
    }
  }
  pengurusBarang.init(
    {
      pegawaiId: DataTypes.INTEGER,
      indukUnitKerjaId: DataTypes.INTEGER,
      noKontak: DataTypes.BIGINT,
    },
    {
      sequelize,
      modelName: "pengurusBarang",
    }
  );
  return pengurusBarang;
};
