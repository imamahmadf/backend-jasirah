'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class templateBPD extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.daftarUnitKerja, {
        foreignKey: "unitKerjaId",
      });
      this.hasMany(models.templateRill, {
        foreignKey: "templateBPDId",
      });
    }
  }
  templateBPD.init({
    namaKota: DataTypes.STRING,
    uangHarian: DataTypes.INTEGER,
    unitKerjaId:DataTypes.INTEGER,
    status: DataTypes.ENUM("aktif", "nonaktif"),
  }, {
    sequelize,
    modelName: 'templateBPD',
  });
  return templateBPD;
};