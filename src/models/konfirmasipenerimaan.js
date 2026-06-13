'use strict';
const {
  Model
} = require('sequelize');
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
      this.hasMany(models.pengisianTanki, {
        foreignKey: "konfirmasiPenerimaanId",
      });
    }
  }
  konfirmasiPenerimaan.init({
    nomor: DataTypes.STRING,
    suratJalanId: DataTypes.INTEGER,
    tanggal: DataTypes.DATE,
    volume: DataTypes.INTEGER,
    pegawaiId: DataTypes.INTEGER,
    catatan: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'konfirmasiPenerimaan',
  });
  return konfirmasiPenerimaan;
};