"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class suratPesanan extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.stokMasuk);
      this.belongsTo(models.indukUnitKerja);
    }
  }
  suratPesanan.init(
    {
      nomor: DataTypes.STRING,
      indukUnitKerjaId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "suratPesanan",
    }
  );
  return suratPesanan;
};
