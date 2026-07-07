"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class jenisMitra extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.mitra, { foreignKey: "jenisMitraId" });
    }
  }
  jenisMitra.init(
    {
      jenis: DataTypes.STRING,
      kode: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "jenisMitra",
    },
  );
  return jenisMitra;
};
