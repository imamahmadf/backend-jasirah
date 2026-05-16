"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class targetTriwulan extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.target);
      this.belongsTo(models.namaTarget);
    }
  }
  targetTriwulan.init(
    {
      nilai: DataTypes.INTEGER,
      targetId: DataTypes.INTEGER,
      namaTargetId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "targetTriwulan",
    }
  );
  return targetTriwulan;
};
