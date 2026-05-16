"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class indukUnitKerja extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.BLUD);
      this.hasMany(models.suratPesanan);
      this.hasMany(models.pengurusBarang);
      this.hasMany(models.bangunan);
      this.hasMany(models.bendahara, {
        foreignKey: "indukUnitKerjaId",
      });
      this.hasMany(models.nomorSP, {
        foreignKey: "indukUnitKerjaId",
      });

      this.hasMany(models.daftarUnitKerja, {
        foreignKey: "indukUnitKerjaId",
      });
      this.belongsTo(models.dalamKota);
      this.belongsTo(models.daftarNomorSurat, {
        foreignKey: "indukUnitKerjaId",
        as: "indukUnitKerja-nomorSurat",
      });
      this.hasMany(models.indukUKSumberDana);
      this.hasMany(models.ttdSuratTugas, {
        foreignKey: "indukUnitKerjaId",
        as: "indukUnitKerja_ttdSuratTugas",
      });
    }
  }
  indukUnitKerja.init(
    {
      kodeInduk: DataTypes.STRING,
      indukUnitKerja: DataTypes.STRING,
      BLUDId: DataTypes.INTEGER,
      templateSuratTugas: DataTypes.STRING,
      templateNotaDinas: DataTypes.STRING,
      templateSuratTugasSingkat: DataTypes.STRING,
      telaahan: DataTypes.STRING,
      templateSPD: DataTypes.STRING,
      penomoran: DataTypes.ENUM("aktif", "nonaktif"),
      keuangan: DataTypes.ENUM("aktif", "nonaktif"),
    },
    {
      sequelize,
      modelName: "indukUnitKerja",
    },
  );
  return indukUnitKerja;
};
