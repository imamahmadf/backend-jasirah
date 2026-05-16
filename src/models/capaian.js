"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class capaian extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.target);
    }
  }
  capaian.init(
    {
      nama: DataTypes.STRING,
      nilai: DataTypes.BIGINT,
      bulan: DataTypes.INTEGER,
      anggaran: DataTypes.BIGINT,
      targetId: DataTypes.INTEGER,
      bukti: DataTypes.TEXT,
      status: DataTypes.ENUM("pengajuan", "diterima", "ditolak"),
    },
    {
      sequelize,
      modelName: "capaian",
    }
  );
  return capaian;
};
