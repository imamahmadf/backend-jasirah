"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ujiLabK3S extends Model {
    static associate(models) {
      this.belongsTo(models.tanki, { foreignKey: "tangkiId" });
      this.belongsTo(models.BABongkar, { foreignKey: "BABongkarId" });
    }
  }
  ujiLabK3S.init(
    {
      tangkiId: DataTypes.INTEGER,
      tanggal: DataTypes.DATE,
      foto: DataTypes.STRING,
      api: DataTypes.DECIMAL(10, 3),
      BSNW: DataTypes.DECIMAL(10, 3),
      suhu: DataTypes.DECIMAL(10, 3),
      sg: DataTypes.DECIMAL(10, 3),
      kualitas: DataTypes.ENUM("OFFSPEC", "ONSPEC"),
      BABongkarId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "ujiLabK3S",
      tableName: "ujiLabK3S",
    },
  );
  return ujiLabK3S;
};
