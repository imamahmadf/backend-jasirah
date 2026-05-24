"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class tunjangan extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.pegawaiTunjangan);
    }
  }
  tunjangan.init(
    {
      nama: DataTypes.STRING,

      tipe: DataTypes.ENUM("persentase", "nominal"),
    },
    {
      sequelize,
      modelName: "tunjangan",
    },
  );
  return tunjangan;
};
