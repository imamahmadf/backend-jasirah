"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class rinObPersediaan extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.tipePersediaan);
      this.belongsTo(models.obPersediaan);
    }
  }
  rinObPersediaan.init(
    {
      nama: DataTypes.STRING,
      kode: DataTypes.STRING,
      obPersediaanId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "rinObPersediaan",
    }
  );
  return rinObPersediaan;
};
