"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class suratKeluar extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.perjalanan, {
        foreignKey: "nomorSuratKeluarId",
      });
      this.belongsTo(models.pegawai, {
        foreignKey: "pegawaiId",
        as: "pegawai",
      });
    }
  }
  suratKeluar.init(
    {
      nomor: DataTypes.STRING,
      perihal: DataTypes.STRING,
      tujuan: DataTypes.STRING,
      tanggalSurat: DataTypes.DATE,
      indukUnitKerjaId: DataTypes.INTEGER,
      pegawaiId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "suratKeluar",
      tableName: "suratKeluars",
    }
  );
  return suratKeluar;
};
