"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class BABongkarTanki extends Model {
    static associate(models) {
      this.belongsTo(models.BABongkar, { foreignKey: "BABongkarId" });
      this.belongsTo(models.tanki, { foreignKey: "tangkiId" });
    }
  }
  BABongkarTanki.init(
    {
      BABongkarId: DataTypes.INTEGER,
      tangkiId: DataTypes.INTEGER,
      ukuranCairan: DataTypes.INTEGER,
      ukuranAir: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "BABongkarTanki",
    },
  );
  return BABongkarTanki;
};
