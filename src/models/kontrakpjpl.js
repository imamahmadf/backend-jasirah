"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class kontrakPJPL extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.pegawai);
      this.hasMany(models.kinerjaPJPL);
    }
  }
  kontrakPJPL.init(
    {
      pegawaiId: DataTypes.INTEGER,
      tanggalAwal: DataTypes.DATE,
      tanggalAkhir: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "kontrakPJPL",
    },
  );
  return kontrakPJPL;
};
