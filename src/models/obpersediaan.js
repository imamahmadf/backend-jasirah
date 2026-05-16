"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class obPersediaan extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.rinObPersediaan);
    }
  }
  obPersediaan.init(
    {
      nama: DataTypes.STRING,
      kode: DataTypes.STRING,
      kodeRekening: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "obPersediaan",
    }
  );
  return obPersediaan;
};
