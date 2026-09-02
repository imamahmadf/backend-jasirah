"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class BAK3S extends Model {
    static associate(models) {
      this.belongsTo(models.BABongkar, { foreignKey: "BABongkarId" });
    }
  }
  BAK3S.init(
    {
      BABongkarId: DataTypes.INTEGER,
      dokumen: DataTypes.STRING,
      api: DataTypes.DECIMAL(10, 3),
      BSNW: DataTypes.DECIMAL(10, 3),
      produksi: DataTypes.DECIMAL(10, 3),
      sg: DataTypes.DECIMAL(10, 3),
    },
    {
      sequelize,
      modelName: "BAK3S",
      tableName: "BAK3S",
    },
  );
  return BAK3S;
};
