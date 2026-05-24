"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class potongan extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.pegawaiPotongan);
    }
  }
  potongan.init(
    {
      nama: DataTypes.STRING,
      nominal: DataTypes.INTEGER,
      tipe: DataTypes.ENUM("presentase", "nominal"),
    },
    {
      sequelize,
      modelName: "potongan",
    },
  );
  return potongan;
};
