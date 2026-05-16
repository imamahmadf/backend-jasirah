"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class templateKwitGlobal extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      this.hasMany(models.kwitGlobal);
    }
  }
  templateKwitGlobal.init(
    {
      nama: DataTypes.STRING,
      dokumen: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "templateKwitGlobal",
    }
  );
  return templateKwitGlobal;
};
