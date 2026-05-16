"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class nomorSuratKeluar extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.perjalanan, {
        foreignKey: "nomorSuratKeluarId",
      });
    }
  }
  nomorSuratKeluar.init(
    {
      nomor: DataTypes.STRING,
      indukUnitKerjaId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "nomorSuratKeluar",
    }
  );
  return nomorSuratKeluar;
};
