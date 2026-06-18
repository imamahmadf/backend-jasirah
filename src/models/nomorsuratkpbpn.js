"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class nomorSuratKPBPN extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  nomorSuratKPBPN.init(
    {
      nomor: DataTypes.STRING,
      nomorUrut: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "nomorSuratKPBPN",
    },
  );
  return nomorSuratKPBPN;
};
