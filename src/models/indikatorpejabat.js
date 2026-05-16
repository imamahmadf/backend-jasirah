"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class indikatorPejabat extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.kinerjaPJPL);
      this.belongsTo(models.pejabatVerifikator);
    }
  }
  indikatorPejabat.init(
    {
      pejabatVerifikatorId: DataTypes.INTEGER,
      indikator: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "indikatorPejabat",
    }
  );
  return indikatorPejabat;
};
