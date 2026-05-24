"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class pegawaiTunjangan extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.pegawai);
      this.belongsTo(models.tunjangan);
    }
  }
  pegawaiTunjangan.init(
    {
      pegawaiId: DataTypes.INTEGER,
      tunjanganId: DataTypes.INTEGER,
      nominal: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "pegawaiTunjangan",
    },
  );
  return pegawaiTunjangan;
};
