"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class kondisiBangunan extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.bangunan);
    }
  }
  kondisiBangunan.init(
    {
      kondisi: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "kondisiBangunan",
    }
  );
  return kondisiBangunan;
};
