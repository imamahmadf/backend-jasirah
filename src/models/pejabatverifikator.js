"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class pejabatVerifikator extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.pegawai, {
        foreignKey: "pegawaiId",
      });
      this.hasMany(models.indikatorPejabat);
      this.belongsTo(models.daftarUnitKerja, {
        foreignKey: "unitKerjaId",
      });
      this.hasMany(models.hasilKerjaKualitatifPJPL, {
        foreignKey: "pejabatVerifikatorId",
      });
    }
  }
  pejabatVerifikator.init(
    {
      pegawaiId: DataTypes.INTEGER,
      unitKerjaId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "pejabatVerifikator",
    },
  );
  return pejabatVerifikator;
};
