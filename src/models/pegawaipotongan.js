"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class pegawaiPotongan extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.pegawai);
      this.belongsTo(models.potongan);
    }
  }
  pegawaiPotongan.init(
    {
      pegawaiId: DataTypes.INTEGER,
      potonganId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "pegawaiPotongan",
    },
  );
  return pegawaiPotongan;
};
