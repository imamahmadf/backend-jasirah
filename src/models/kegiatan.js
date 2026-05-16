"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class kegiatan extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.program);
      this.hasMany(models.subKegPer);
      this.hasMany(models.indikator);
      this.belongsTo(models.daftarUnitKerja, {
        foreignKey: "unitKerjaId",
      });
    }
  }
  kegiatan.init(
    {
      nama: DataTypes.STRING,
      kode: DataTypes.STRING,
      programId: DataTypes.INTEGER,
      unitKerjaId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "kegiatan",
      paranoid: true,
    }
  );
  return kegiatan;
};
