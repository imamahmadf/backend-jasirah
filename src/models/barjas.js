"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class barjas extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.SP, { foreignKey: "SPId" });
      this.belongsTo(models.jenisBarjas, { foreignKey: "jenisBarjasId" });
      this.hasMany(models.itemDokumenBarjas, { foreignKey: "barjasId" });
    }
  }
  barjas.init(
    {
      nama: DataTypes.STRING,
      jumlah: DataTypes.INTEGER,
      jenisBarjasId: DataTypes.INTEGER,
      SPId: DataTypes.INTEGER,
      harga: DataTypes.BIGINT,
    },
    {
      sequelize,
      modelName: "barjas",
    }
  );
  return barjas;
};
