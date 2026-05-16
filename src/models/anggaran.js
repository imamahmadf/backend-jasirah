"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class anggaran extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.tipePerjalanan);
      this.belongsTo(models.daftarSubKegiatan, {
        foreignKey: "subKegiatanId",
      });
    }
  }
  anggaran.init(
    {
      subKegiatanId: DataTypes.INTEGER,
      tipePerjalananId: DataTypes.INTEGER,
      tahun: DataTypes.DATE,
      nilai: DataTypes.BIGINT,
    },
    {
      sequelize,
      modelName: "anggaran",
    }
  );
  return anggaran;
};
