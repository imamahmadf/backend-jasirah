"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class stockOpnameTanki extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.tanki, { foreignKey: "tankiId" });
    }
  }
  stockOpnameTanki.init(
    {
      tinggiMinyak: DataTypes.DECIMAL(10, 3),
      tinggiAir: DataTypes.DECIMAL(10, 3),
      tanggal: DataTypes.DATE,
      tankiId: DataTypes.INTEGER,
      suhu: DataTypes.DECIMAL(10, 3),
    },
    {
      sequelize,
      modelName: "stockOpnameTanki",
    },
  );
  return stockOpnameTanki;
};
