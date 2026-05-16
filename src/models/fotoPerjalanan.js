"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class fotoPerjalanan extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.perjalanan, {
        foreignKey: "perjalananId",
      });
    }
  }
  fotoPerjalanan.init(
    {
      foto: DataTypes.STRING,
      perjalananId: DataTypes.INTEGER,
      tanggal: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "fotoPerjalanan",
      tableName: "fotoPerjalanans", // Nama tabel di database
    }
  );
  return fotoPerjalanan;
};
