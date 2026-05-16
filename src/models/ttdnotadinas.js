"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ttdNotaDinas extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.hasMany(models.perjalanan);
      this.belongsTo(models.daftarUnitKerja, {
        foreignKey: "unitKerjaId",
        as: "unitKerja_notaDinas",
      });
      this.belongsTo(models.pegawai, {
        foreignKey: "pegawaiId",
        as: "pegawai_notaDinas",
      });
    }
  }
  ttdNotaDinas.init(
    {
      jabatan: DataTypes.STRING,
      pegawaiId: DataTypes.INTEGER,
      unitKerjaId: DataTypes.INTEGER,
    },
    { paranoid: true, sequelize, modelName: "ttdNotaDinas" }
  );
  return ttdNotaDinas;
};
