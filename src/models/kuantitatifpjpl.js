"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class kualitatifPJPL extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      kualitatifPJPL.hasMany(models.hasilKerjaKualitatifPJPL, {
        foreignKey: "kualitatifPJPLId",
      });
    }
  }
  kualitatifPJPL.init(
    {
      indikator: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "kualitatifPJPL",
    },
  );
  return kualitatifPJPL;
};
