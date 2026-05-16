"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class persediaan extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.tipePersediaan);
      this.hasMany(models.stokMasuk);
    }
  }
  persediaan.init(
    {
      kodeBarang: DataTypes.STRING,
      nama: DataTypes.STRING,
      NUSP: DataTypes.STRING,
      tipePersediaanId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "persediaan",
    }
  );
  return persediaan;
};
