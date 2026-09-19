"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class icp extends Model {
    static associate() {}
  }
  icp.init(
    {
      harga: DataTypes.DECIMAL(10, 2),
      kursTengah: DataTypes.DECIMAL(12, 2),
      bulan: DataTypes.DATEONLY,
      dokumen: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "icp",
    },
  );
  return icp;
};
