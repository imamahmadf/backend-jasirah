"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class mutasiKendaraan extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.pegawai, {
        foreignKey: "pegawaiId",
        as: "pegawaiTujuan",
      });
      this.belongsTo(models.pegawai, {
        foreignKey: "asalPegawaiId",
        as: "pegawaiAsal",
      });
      this.belongsTo(models.kendaraan);
      this.belongsTo(models.daftarUnitKerja, {
        foreignKey: "unitKerjaId",
        as: "unitKerjaTujuan",
      });
      this.belongsTo(models.daftarUnitKerja, {
        foreignKey: "asalUnitKerjaId",
        as: "unitKerjaAsal",
      });
    }
  }
  mutasiKendaraan.init(
    {
      kendaraanId: DataTypes.INTEGER,
      unitKerjaId: DataTypes.INTEGER,
      pegawaiId: DataTypes.INTEGER,
      keterangan: DataTypes.STRING,
      asalUnitKerjaId: DataTypes.INTEGER,
      asalPegawaiId: DataTypes.INTEGER,
      tanggal: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "mutasiKendaraan",
    }
  );
  return mutasiKendaraan;
};
