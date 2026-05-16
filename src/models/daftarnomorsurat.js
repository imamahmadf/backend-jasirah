"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class daftarNomorSurat extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.jenisSurat, {
        foreignKey: "jenisId",
        as: "jenisSurat",
      });
      this.belongsTo(models.indukUnitKerja, {
        foreignKey: "indukUnitKerjaId",
        as: "indukUnitKerja-nomorSurat",
      });
    }
  }
  daftarNomorSurat.init(
    {
      nomorLoket: DataTypes.INTEGER,
      jenisId: DataTypes.INTEGER,
      indukUnitKerjaId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "daftarNomorSurat",
    }
  );
  return daftarNomorSurat;
};
