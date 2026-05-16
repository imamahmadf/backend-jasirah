"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class profile extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.user);
      this.belongsTo(models.pegawai);
      this.belongsTo(models.daftarUnitKerja, {
        foreignKey: "unitKerjaId",
        as: "unitKerja_profile",
      });
    }
  }
  profile.init(
    {
      nama: DataTypes.STRING,
      profilePic: DataTypes.STRING,
      userId: DataTypes.INTEGER,
      unitKerjaId: DataTypes.INTEGER,
      pegawaiId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "profile",
    }
  );
  return profile;
};
