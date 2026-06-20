"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class userKPBPN extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.userRoleKPBPN);
    }
  }
  userKPBPN.init(
    {
      nama: DataTypes.STRING,
      namaPengguna: DataTypes.STRING,
      password: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "userKPBPN",
    },
  );
  return userKPBPN;
};
