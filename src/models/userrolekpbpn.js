"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class userRoleKPBPN extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.userKPBPN);
      this.belongsTo(models.roleKPBPN);
    }
  }
  userRoleKPBPN.init(
    {
      userKPBPNId: DataTypes.INTEGER,
      roleKPBPNId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "userRoleKPBPN",
    },
  );
  return userRoleKPBPN;
};
