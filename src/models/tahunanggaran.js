"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class tahunAnggaran extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.target);
      this.belongsTo(models.jenisAnggaran);
    }
  }
  tahunAnggaran.init(
    {
      tahun: DataTypes.INTEGER,
      anggaran: DataTypes.BIGINT,
      jenisAnggaranId: DataTypes.INTEGER,
      targetId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "tahunAnggaran",
    }
  );
  return tahunAnggaran;
};
