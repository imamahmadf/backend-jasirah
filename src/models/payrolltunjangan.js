"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class payrollTunjangan extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.payroll);
    }
  }
  payrollTunjangan.init(
    {
      payrollId: DataTypes.INTEGER,
      nama: DataTypes.STRING,
      nominal: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "payrollTunjangan",
    },
  );
  return payrollTunjangan;
};
