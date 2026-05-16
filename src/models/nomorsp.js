"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class nomorSP extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      this.belongsTo(models.indukUnitKerja, { foreignKey: "indukUnitKerjaId" });
    }
  }
  nomorSP.init(
    {
      indukUnitKerjaId: DataTypes.INTEGER,
      nomorSurat: DataTypes.STRING,
      nomorLoket: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "nomorSP",
    }
  );
  return nomorSP;
};
