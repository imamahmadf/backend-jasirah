"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class statusPengajuanKpbpn extends Model {
    static associate(models) {
      this.hasMany(models.pengajuanBarjasKpbpn, {
        foreignKey: "statusPengajuanKpbpnId",
      });
    }
  }

  statusPengajuanKpbpn.init(
    {
      nama: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "statusPengajuanKpbpn",
    },
  );

  return statusPengajuanKpbpn;
};
