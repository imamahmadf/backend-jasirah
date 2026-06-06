"use strict";
const { Model, DATE } = require("sequelize");
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
      this.belongsTo(models.statusPresensi);
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
      statusPresensiId: DataTypes.INTEGER,
      tanggal: DataTypes.DATE,
      jamKerja: DataTypes.INTEGER,
      lemburHarian: {
        type: DataTypes.INTEGER,
        field: "lemburharian",
      },
    },
    {
      sequelize,
      modelName: "presensi",
    },
  );
  return Presensi;
};
