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
      this.belongsTo(models.satuanVolume, { foreignKey: "satuanVolumeId" });
      this.belongsTo(models.stasiunPengumpulMinyak, {
        foreignKey: "stasiunPengumpulMinyakId",
      });
      this.hasMany(models.pengisianTanki, { foreignKey: "tangkiId" });
      this.hasMany(models.BABongkarTanki, { foreignKey: "tangkiId" });
      this.hasMany(models.ujiLabK3S, {
        foreignKey: "tangkiId",
        as: "ujiLabK3S",
      });
      this.hasMany(models.stockOpnameTanki, { foreignKey: "tankiId" });
    }
  }
  tanki.init(
    {
      unitKerjaId: DataTypes.INTEGER,
      stasiunPengumpulMinyakId: DataTypes.INTEGER,
      kode: DataTypes.STRING,
      foto: DataTypes.STRING,
      kapasitas: DataTypes.INTEGER,
      factorTank: DataTypes.DECIMAL(10, 3),
      satuanVolumeId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "tanki",
    },
  );
  return tanki;
};
