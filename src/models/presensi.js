"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Presensi extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.pegawai, {
        foreignKey: "pegawaiId",
        as: "pegawai",
      });
      this.belongsTo(models.daftarUnitKerja, {
        foreignKey: "unitKerjaId",
        as: "daftarUnitKerja",
      });
    }
  }
  Presensi.init(
    {
      pegawaiId: DataTypes.INTEGER,
      jamMasuk: DataTypes.DATE,
      jamPulang: DataTypes.DATE,
      latitudeMasuk: DataTypes.DECIMAL,
      longitudeMasuk: DataTypes.DECIMAL,
      latitudePulang: DataTypes.DECIMAL,
      longitudePulang: DataTypes.DECIMAL,
      unitKerjaId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Presensi",
    },
  );
  return Presensi;
};
