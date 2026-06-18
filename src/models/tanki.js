"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class tanki extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.daftarUnitKerja, { foreignKey: "unitKerjaId" });
      this.hasMany(models.pengisianTanki, { foreignKey: "tangkiId" });
    }
  }
  tanki.init(
    {
      unitKerjaId: DataTypes.INTEGER,
      kode: DataTypes.STRING,
      foto: DataTypes.STRING,
      kapasitas: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "tanki",
    },
  );
  return tanki;
};
