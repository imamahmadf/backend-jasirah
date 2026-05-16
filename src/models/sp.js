"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class SP extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.rekanan, { foreignKey: "rekananId" });
      this.belongsTo(models.akunBelanja, { foreignKey: "akunBelanjaId" });
      this.belongsTo(models.subKegPer, { foreignKey: "subKegPerId" });
      this.hasMany(models.barjas, { foreignKey: "SPId" });
      this.hasMany(models.dokumenBarjas, { foreignKey: "SPId" });
    }
  }
  SP.init(
    {
      nomor: DataTypes.STRING,
      tanggal: DataTypes.DATE,
      rekananId: DataTypes.INTEGER,
      subKegPerId: DataTypes.INTEGER,
      akunBelanjaId: DataTypes.INTEGER,

      unitKerjaId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "SP",
    }
  );
  return SP;
};
