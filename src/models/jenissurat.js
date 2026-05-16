"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class jenisSurat extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.daftarNomorSurat, {
        foreignKey: "jenisId",
        as: "jenisSurat",
      });
    }
  }
  jenisSurat.init(
    {
      jenis: DataTypes.STRING,
      nomorSurat: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "jenisSurat",
    }
  );
  return jenisSurat;
};
