"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class penghuni extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.bangunan);
    }
  }
  penghuni.init(
    {
      pegawaiId: DataTypes.INTEGER,
      bangunanId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "penghuni",
    }
  );
  return penghuni;
};
