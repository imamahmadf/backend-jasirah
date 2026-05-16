"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class dokumenBarjas extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.SP, { foreignKey: "SPId" });
      this.belongsTo(models.jenisDokumenBarjas, {
        foreignKey: "jenisDokumenBarjasId",
      });

      this.hasMany(models.itemDokumenBarjas, { foreignKey: "dokumenBarjasId" });
    }
  }
  dokumenBarjas.init(
    {
      tanggal: DataTypes.DATE,
      nomor: DataTypes.STRING,
      SPId: DataTypes.INTEGER,
      jenisDokumenBarjasId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "dokumenBarjas",
    }
  );
  return dokumenBarjas;
};
