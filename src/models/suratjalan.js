"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class suratJalan extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.mitra, { foreignKey: "mitraId" });
      this.belongsTo(models.transportir, { foreignKey: "transportirId" });
      this.belongsTo(models.supir, { foreignKey: "supirId" });
      this.belongsTo(models.daftarUnitKerja, { foreignKey: "unitKerjaId" });
      this.belongsTo(models.statusSuratJalan, {
        foreignKey: "statusSuratJalanId",
      });
      this.hasMany(models.konfirmasiPenerimaan, { foreignKey: "suratJalanId" });
      this.belongsTo(models.satuanVolume, { foreignKey: "satuanVolumeId" });
    }
  }
  suratJalan.init(
    {
      nomor: DataTypes.STRING,
      tanggal: DataTypes.DATE,
      mitraId: DataTypes.INTEGER,
      transportirId: DataTypes.INTEGER,
      unitKerjaId: DataTypes.INTEGER,
      volume: DataTypes.INTEGER,
      supirId: DataTypes.INTEGER,
      statusSuratJalanId: DataTypes.INTEGER,
      jamDatang: DataTypes.DATE,
      jamPergi: DataTypes.DATE,
      verifikasi: DataTypes.STRING,
      satuanVolumeId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "suratJalan",
    },
  );
  return suratJalan;
};
