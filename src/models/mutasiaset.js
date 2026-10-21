"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class mutasiAset extends Model {
    static associate(models) {
      this.belongsTo(models.aset, { foreignKey: "asetId" });
      this.belongsTo(models.daftarUnitKerja, {
        foreignKey: "unitKerjaAsalId",
        as: "unitKerjaAsal",
      });
      this.belongsTo(models.daftarUnitKerja, {
        foreignKey: "unitKerjaTujuanId",
        as: "unitKerjaTujuan",
      });
      this.belongsTo(models.pegawai, {
        foreignKey: "penanggungjawabAsalId",
        as: "penanggungJawabAsal",
      });
      this.belongsTo(models.pegawai, {
        foreignKey: "penanggungjawabTujuanId",
        as: "penanggungJawabTujuan",
      });
    }
  }
  mutasiAset.init(
    {
      asetId: DataTypes.INTEGER,
      unitKerjaAsalId: DataTypes.INTEGER,
      unitKerjaTujuanId: DataTypes.INTEGER,
      penanggungjawabAsalId: DataTypes.INTEGER,
      penanggungjawabTujuanId: DataTypes.INTEGER,
      tanggal: DataTypes.DATE,
      keterangan: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "mutasiAset",
    },
  );
  return mutasiAset;
};
