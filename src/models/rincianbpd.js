"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class rincianBPD extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.personil);
      this.belongsTo(models.jenisRincianBPD, { foreignKey: "jenisId" });

      this.hasMany(models.rill, { foreignKey: "rincianBPDId" });
    }
  }
  rincianBPD.init(
    {
      personilId: DataTypes.INTEGER,
      item: DataTypes.STRING,
      satuan: DataTypes.STRING,
      bukti: DataTypes.STRING,
      qty: DataTypes.INTEGER,
      nilai: DataTypes.INTEGER,
      jenisId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "rincianBPD",
    }
  );
  return rincianBPD;
};
