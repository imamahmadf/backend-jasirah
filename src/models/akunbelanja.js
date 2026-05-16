"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class akunBelanja extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.SP, { foreignKey: "akunBelanjaId" });
      this.belongsTo(models.jenisBelanja, { foreignKey: "jenisBelanjaId" });
    }
  }
  akunBelanja.init(
    {
      akun: DataTypes.STRING,
      kode: DataTypes.STRING,
      jenisBelanjaId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "akunBelanja",
    }
  );
  return akunBelanja;
};
