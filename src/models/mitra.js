'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class mitra extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.hasMany(models.supir, { foreignKey: "mitraId" });
      this.hasMany(models.suratJalan, { foreignKey: "mitraId" });
    }
  }
  mitra.init({
    nama: DataTypes.STRING,
    alamat: DataTypes.STRING,
    npwp: DataTypes.STRING,
    kontak: DataTypes.STRING,
    penanggungJawab: DataTypes.STRING,
    kode: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'mitra',
  });
  return mitra;
};