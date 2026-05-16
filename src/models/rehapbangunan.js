"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class rehapBangunan extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.bangunan);
    }
  }
  rehapBangunan.init(
    {
      bangunanId: DataTypes.INTEGER,
      deskripsi: DataTypes.STRING,
      tahun: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "rehapBangunan",
    }
  );
  return rehapBangunan;
};
