"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class kodeKlasifikasi extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      this.belongsTo(models.klasifikasi, {
        foreignKey: "klasifikasiId",
      });
    }
  }
  kodeKlasifikasi.init(
    {
      kode: DataTypes.STRING,
      klasifikasiId: DataTypes.INTEGER,
      kegiatan: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "kodeKlasifikasi",
    }
  );
  return kodeKlasifikasi;
};
