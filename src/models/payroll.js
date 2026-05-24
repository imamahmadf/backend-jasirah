"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class payroll extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.pegawai);
      this.hasMany(models.payrollTunjangan);
      this.hasMany(models.payrollPotongan);
    }
  }
  payroll.init(
    {
      pegawaiId: DataTypes.INTEGER,
      periode: DataTypes.STRING,
      gajiPokok: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "payroll",
    },
  );
  return payroll;
};
