"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class konfirmasiPenerimaan extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.suratJalan, { foreignKey: "suratJalanId" });
      this.belongsTo(models.pegawai, { foreignKey: "pegawaiId" });
      this.belongsTo(models.userKPBPN, {
        foreignKey: "userPKId",
        as: "userPK",
      });
      this.belongsTo(models.userKPBPN, {
        foreignKey: "userLabId",
        as: "userLab",
      });
      this.belongsToMany(models.pengisianTanki, {
        through: "pengisianTankiKonfirmasis",
        foreignKey: "konfirmasiPenerimaanId",
        otherKey: "pengisianTankiId",
      });
    }
  }
  konfirmasiPenerimaan.init(
    {
      nomor: DataTypes.STRING,
      suratJalanId: DataTypes.INTEGER,
      tanggal: DataTypes.DATE,
      jamKedatangan: DataTypes.TIME,
      volume: DataTypes.INTEGER,
      pegawaiId: DataTypes.INTEGER,
      catatan: DataTypes.STRING,
      api: DataTypes.DECIMAL(10, 3),
      BSNW: DataTypes.DECIMAL(10, 3),
      foto: DataTypes.STRING,
      fotoLab: DataTypes.STRING,
      userPKId: DataTypes.INTEGER,
      userLabId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "konfirmasiPenerimaan",
    },
  );
  return konfirmasiPenerimaan;
};
