"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class profesi extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.pegawai, {
        foreignKey: "profesiId",
        as: "profesi",
      });

      // Relasi dengan riwayat pegawai (profesi lama)
      this.hasMany(models.riwayatPegawai, {
        foreignKey: "profesiLamaId",
        as: "riwayatPegawaiProfesiLama",
      });
    }
  }
  profesi.init(
    {
      nama: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "profesi",
    }
  );
  return profesi;
};
