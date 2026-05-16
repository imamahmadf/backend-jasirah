"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class tempat extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.perjalanan);
      this.belongsTo(models.dalamKota, {
        foreignKey: "dalamKotaId",
        as: "dalamKota",
      });
      this.belongsTo(models.jenisTempat);
    }
  }
  tempat.init(
    {
      perjalananId: DataTypes.INTEGER,
      tempat: DataTypes.STRING,
      jenisId: DataTypes.INTEGER,
      dalamKotaId: DataTypes.INTEGER,
      tanggalBerangkat: DataTypes.DATE,
      tanggalPulang: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "tempat",
    }
  );
  return tempat;
};
