"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class KPA extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.daftarUnitKerja, {
        foreignKey: "unitKerjaId",
      });
      this.hasMany(models.perjalanan);
      this.belongsTo(models.pegawai, {
        foreignKey: "pegawaiId",
        as: "pegawai_KPA",
      });
      this.hasMany(models.kwitGlobal, {
        foreignKey: "KPAId",
      });
      // define association here
    }
  }
  KPA.init(
    {
      pegawaiId: DataTypes.INTEGER,
      unitKerjaId: DataTypes.INTEGER,
      jabatan: DataTypes.STRING,
    },
    { paranoid: true, sequelize, modelName: "KPA" }
  );
  return KPA;
};
