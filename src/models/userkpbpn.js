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
      this.hasMany(models.userRoleKPBPN);
      this.belongsTo(models.mitra, { foreignKey: "mitraId" });
      this.hasMany(models.pengisianTanki, { foreignKey: "userKPBPNId" });
      this.hasMany(models.BABongkar, { foreignKey: "userKPBPNId" });
      this.hasMany(models.BAK3S, { foreignKey: "userKPBPNId" });
    }
  }
  userKPBPN.init(
    {
      nama: DataTypes.STRING,
      namaPengguna: DataTypes.STRING,
      password: DataTypes.STRING,
      mitraId: DataTypes.INTEGER,
      profilePic: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "userKPBPN",
    },
  );
  return userKPBPN;
};
