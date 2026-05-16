"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class bendahara extends Model {
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
      });
      this.belongsTo(models.pegawai, {
        foreignKey: "pegawaiId",
        as: "pegawai_bendahara",
      });
      this.belongsTo(models.sumberDana, {
        foreignKey: "sumberDanaId",
      });
      this.hasMany(models.kwitGlobal, {
        foreignKey: "bendaharaId",
      });
    }
  }
  bendahara.init(
    {
      pegawaiId: DataTypes.INTEGER,
      indukUnitKerjaId: DataTypes.INTEGER,
      sumberDanaId: DataTypes.INTEGER,
      jabatan: DataTypes.STRING,
      deletedAt: DataTypes.DATE,
    },
    { paranoid: true, sequelize, modelName: "bendahara" }
  );
  return bendahara;
};
