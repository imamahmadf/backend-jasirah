"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class kendaraanDinas extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.kendaraan);

      this.hasMany(models.perjalanan, {
        foreignKey: "kendaraanDinasId",
      });
      // this.belongsTo(models.daftarUnitKerja, {
      //   foreignKey: "unitKerjaId",
      //   as: "kendaraanUnit",
      // });
    }
  }
  kendaraanDinas.init(
    {
      // tanggalAwal: DataTypes.DATE,
      // tanggalAkhir: DataTypes.DATE,
      kendaraanId: DataTypes.INTEGER,

      // perjalananId: DataTypes.INTEGER,
      // tujuan: DataTypes.STRING,
      kmAkhir: DataTypes.STRING,
      kondisiAkhir: DataTypes.STRING,
      catatan: DataTypes.STRING,
      // unitKerjaId: DataTypes.INTEGER,
      jarak: DataTypes.INTEGER,
      status: DataTypes.ENUM("dipinjam", "kembali"),
      keterangan: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "kendaraanDinas",
    }
  );
  return kendaraanDinas;
};
