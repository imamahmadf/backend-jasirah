"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class jenisDokumenBarjas extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.dokumenBarjas, {
        foreignKey: "jenisDokumenBarjasId",
      });
    }
  }
  jenisDokumenBarjas.init(
    {
      jenis: DataTypes.STRING,
      nomorSurat: DataTypes.STRING,
      nomorLoket: DataTypes.INTEGER,
      indukUnitKerjaId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "jenisDokumenBarjas",
    }
  );
  return jenisDokumenBarjas;
};
