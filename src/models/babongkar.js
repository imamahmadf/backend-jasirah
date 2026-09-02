"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class BABongkar extends Model {
    static associate(models) {
      this.hasMany(models.pengisianTanki, {
        foreignKey: "BABongkarId",
      });
      this.hasMany(models.BABongkarTanki, {
        foreignKey: "BABongkarId",
      });
      this.hasMany(models.ujiLabK3S, {
        foreignKey: "BABongkarId",
        as: "ujiLabK3S",
      });
      this.hasOne(models.BAK3S, {
        foreignKey: "BABongkarId",
        as: "BAK3S",
      });
    }
  }
  BABongkar.init(
    {
      tanggal: DataTypes.DATE,
      ukuranCairan: DataTypes.INTEGER,
      ukuranAir: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "BABongkar",
    },
  );
  return BABongkar;
};
