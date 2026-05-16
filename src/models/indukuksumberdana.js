"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class indukUKSumberDana extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.indukUnitKerja);
      this.belongsTo(models.sumberDana);
      // define association here
    }
  }
  indukUKSumberDana.init(
    {
      indukUnitKerjaId: DataTypes.INTEGER,
      sumberDanaId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "indukUKSumberDana",
    }
  );
  return indukUKSumberDana;
};
