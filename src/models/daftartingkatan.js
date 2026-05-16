"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class daftarTingkatan extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.pegawai, {
        foreignKey: "tingkatanId",
        as: "daftarTingkatan",
      });
    }
  }
  daftarTingkatan.init(
    {
      tingkatan: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "daftarTingkatan",
    }
  );
  return daftarTingkatan;
};
