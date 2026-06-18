"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class satuanVolume extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.pengisianTanki, { foreignKey: "satuanVolumeId" });
      this.hasMany(models.transportir, { foreignKey: "satuanVolumeId" });
      this.hasMany(models.suratJalan, { foreignKey: "satuanVolumeId" });
    }
  }
  satuanVolume.init(
    {
      satuan: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "satuanVolume",
    },
  );
  return satuanVolume;
};
