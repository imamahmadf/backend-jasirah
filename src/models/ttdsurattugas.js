"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ttdSuratTugas extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.perjalanan);
      this.belongsTo(models.indukUnitKerja, {
        foreignKey: "indukUnitKerjaId",
        as: "indukUnitKerja_ttdSuratTugas",
      });
      this.belongsTo(models.pegawai, {
        foreignKey: "pegawaiId",
        as: "pegawai",
      });
    }
  }
  ttdSuratTugas.init(
    {
      // nama: DataTypes.STRING,
      jabatan: DataTypes.STRING,
      pegawaiId: DataTypes.INTEGER,
      indukUnitKerjaId: DataTypes.INTEGER,
      // pangkat: DataTypes.STRING,
      // golongan: DataTypes.STRING,
      // nip: DataTypes.STRING,
    },
    { paranoid: true, sequelize, modelName: "ttdSuratTugas" }
  );
  return ttdSuratTugas;
};
