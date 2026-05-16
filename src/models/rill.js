"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class rill extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      this.belongsTo(models.rincianBPD, { foreignKey: "rincianBPDId" });
    }
  }
  rill.init(
    {
      rincianBPDId: DataTypes.INTEGER,
      item: DataTypes.STRING,
      nilai: DataTypes.INTEGER,
      jenisId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "rill",
    }
  );
  return rill;
};
