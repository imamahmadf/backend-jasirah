"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class pengisianTanki extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsToMany(models.konfirmasiPenerimaan, {
        through: "pengisianTankiKonfirmasis",
        foreignKey: "pengisianTankiId",
        otherKey: "konfirmasiPenerimaanId",
      });
      this.belongsTo(models.tanki, { foreignKey: "tangkiId" });
      this.belongsTo(models.BABongkar, { foreignKey: "BABongkarId" });
      this.belongsTo(models.satuanVolume, { foreignKey: "satuanVolumeId" });
    }
  }
  pengisianTanki.init(
    {
      tangkiId: DataTypes.INTEGER,
      flowMeter: DataTypes.INTEGER,
      gross: DataTypes.INTEGER,
      net: DataTypes.INTEGER,
      penampilanVisual: DataTypes.STRING,
      warna: DataTypes.STRING,
      kandunganAir: DataTypes.INTEGER,
      BSW: DataTypes.INTEGER,
      catatan: DataTypes.STRING,
      saksi: DataTypes.STRING,
      BABongkarId: DataTypes.INTEGER,
      tanggal: DataTypes.DATE,
      nomorSurat: DataTypes.STRING,
      satuanVolumeId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "pengisianTanki",
    },
  );
  return pengisianTanki;
};
