"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class BLUD extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.indukUnitKerja);
    }
  }
  BLUD.init(
    {
      jenis: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "BLUD",
    }
  );
  return BLUD;
};
