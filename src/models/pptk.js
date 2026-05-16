"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class PPTK extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.perjalanan);
      this.belongsTo(models.daftarUnitKerja, {
        foreignKey: "unitKerjaId",
      });
      this.belongsTo(models.pegawai, {
        foreignKey: "pegawaiId",
        as: "pegawai_PPTK",
      });

      this.hasMany(models.kwitGlobal, {
        foreignKey: "PPTKId",
      });
    }
  }
  PPTK.init(
    {
      jabatan: DataTypes.STRING,
      pegawaiId: DataTypes.INTEGER,
      unitKerjaId: DataTypes.INTEGER,
    },
    { paranoid: true, sequelize, modelName: "PPTK" }
  );
  return PPTK;
};
