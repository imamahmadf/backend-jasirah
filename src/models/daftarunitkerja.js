"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class daftarUnitKerja extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.pegawai, {
        foreignKey: "unitKerjaId",
        as: "daftarUnitKerja",
      });

      this.hasMany(models.kendaraan, {
        foreignKey: "unitKerjaId",
        as: "kendaraanUK",
      });

      // this.belongsTo(models.dalamKota);
      // this.belongsTo(models.ttdSuratTugas, {
      //   foreignKey: "unitKerjaId",
      //   as: "unitKerja_ttdSuratTugas",
      // });
      this.hasMany(models.ttdNotaDinas, {
        foreignKey: "unitKerjaId",
        as: "unitKerja_notaDinas",
      });
      this.hasMany(models.PPTK, {
        foreignKey: "unitKerjaId",
      });
      this.hasMany(models.KPA, {
        foreignKey: "unitKerjaId",
      });

      this.hasMany(models.kwitGlobal, {
        foreignKey: "unitKerjaId",
      });

      this.hasMany(models.daftarSubKegiatan, {
        foreignKey: "unitKerjaId",
      });

      this.belongsTo(models.profile, {
        foreignKey: "unitKerjaId",
        as: "unitKerja_profile",
      });

      // this.hasMany(models.kendaraanDinas, {
      //   foreignKey: "unitKerjaId",
      // });

      // this.belongsTo(models.daftarNomorSurat, {
      //   foreignKey: "unitKerjaId",
      //   as: "unitKerja-nomorSurat",
      // });
      this.belongsTo(models.indukUnitKerja, {
        foreignKey: "indukUnitKerjaId",
      });
      this.hasMany(models.mutasiKendaraan, {
        foreignKey: "unitKerjaId",
        as: "unitKerjaTujuan",
      });

      this.hasMany(models.mutasiKendaraan, {
        foreignKey: "asalUnitKerjaId",
        as: "unitKerjaAsal",
      });
      this.hasMany(models.stokMasuk, {
        foreignKey: "unitKerjaId",
      });

      this.hasMany(models.subKegPer, {
        foreignKey: "unitKerjaId",
      });

      this.hasMany(models.kegiatan, {
        foreignKey: "unitKerjaId",
      });

      this.hasMany(models.program, {
        foreignKey: "unitKerjaId",
      });

      // Relasi dengan riwayat pegawai (unit kerja lama)
      this.hasMany(models.riwayatPegawai, {
        foreignKey: "unitKerjaLamaId",
        as: "riwayatPegawaiUnitKerjaLama",
      });
      this.hasMany(models.pejabatVerifikator, { foreignKey: "unitKerjaId" });
      this.hasMany(models.templateBPD, {
        foreignKey: "unitKerjaId",
      });
    }
  }
  daftarUnitKerja.init(
    {
      unitKerja: DataTypes.STRING,
      kode: DataTypes.STRING,
      asal: DataTypes.STRING,
      indukUnitKerjaId: DataTypes.INTEGER,
      // templateSuratTugas: DataTypes.STRING,
      // templateSuratTugasSingkat: DataTypes.STRING,
      // templateNotaDinas: DataTypes.STRING,
      // templateSPD: DataTypes.STRING,
      // tempalteKuitansi: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "daftarUnitKerja",
    }
  );
  return daftarUnitKerja;
};
