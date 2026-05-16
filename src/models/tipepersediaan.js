"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class tipePersediaan extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.persediaan);
      this.belongsTo(models.rinObPersediaan);
    }
  }
  tipePersediaan.init(
    {
      kodeRekening: DataTypes.STRING,
      nama: DataTypes.STRING,
      rinObPersediaanId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "tipePersediaan",
    }
  );
  return tipePersediaan;
};
