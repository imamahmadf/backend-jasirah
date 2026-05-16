"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class subKegPer extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.kegiatan);
      this.hasMany(models.indikator);
      this.hasMany(models.SP);
      this.belongsTo(models.daftarUnitKerja, {
        foreignKey: "unitKerjaId",
      });
    }
  }
  subKegPer.init(
    {
      nama: DataTypes.STRING,
      kode: DataTypes.STRING,
      kegiatanId: DataTypes.INTEGER,
      unitKerjaId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "subKegPer",
      paranoid: true,
    }
  );
  return subKegPer;
};
