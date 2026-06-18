"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class BAPenerimaan extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      this.hasMany(models.pengisianTanki, {
        foreignKey: "BAPenerimaanId",
      });
    }
  }
  BAPenerimaan.init(
    {
      tanggal: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "BAPenerimaan",
    },
  );
  return BAPenerimaan;
};
