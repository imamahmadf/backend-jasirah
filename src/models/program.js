"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class program extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.kegiatan);
      this.hasMany(models.indikator);
      this.belongsTo(models.daftarUnitKerja, {
        foreignKey: "unitKerjaId",
      });
    }
  }
  program.init(
    {
      nama: DataTypes.STRING,
      kode: DataTypes.STRING,
      unitKerjaId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "program",
      paranoid: true,
    }
  );
  return program;
};
