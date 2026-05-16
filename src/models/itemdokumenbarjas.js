"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class itemDokumenBarjas extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.barjas, { foreignKey: "barjasId" });
      this.belongsTo(models.dokumenBarjas, { foreignKey: "dokumenBarjasId" });
    }
  }
  itemDokumenBarjas.init(
    {
      jumlah: DataTypes.INTEGER,
      barjasId: DataTypes.INTEGER,
      dokumenBarjasId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "itemDokumenBarjas",
    }
  );
  return itemDokumenBarjas;
};
