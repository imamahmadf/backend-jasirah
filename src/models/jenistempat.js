"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class jenisTempat extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.tempat);
    }
  }
  jenisTempat.init(
    {
      jenis: DataTypes.STRING,
      kodeRekening: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "jenisTempat",
    }
  );
  return jenisTempat;
};
