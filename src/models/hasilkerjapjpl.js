"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class hasilKerjaPJPL extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.realisasiPJPL, {
        foreignKey: "realisasiPJPLId",
        as: "realisasiPJPL",
      });
    }
  }
  hasilKerjaPJPL.init(
    {
      hasil: DataTypes.INTEGER,
      nilai: DataTypes.INTEGER,
      status: DataTypes.ENUM("diajukan", "ditolak", "diterima"),
      realisasiPJPLId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "hasilKerjaPJPL",
    }
  );
  return hasilKerjaPJPL;
};
