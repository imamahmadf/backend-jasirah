"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class daftarPangkat extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.pegawai, {
        foreignKey: "pangkatId",
        as: "daftarPangkat",
      });

      // Relasi dengan riwayat pegawai
      this.hasMany(models.riwayatPegawai, {
        foreignKey: "pangkatId",
        as: "riwayatPegawaiPangkat",
      });
    }
  }
  daftarPangkat.init(
    {
      pangkat: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "daftarPangkat",
    }
  );
  return daftarPangkat;
};
