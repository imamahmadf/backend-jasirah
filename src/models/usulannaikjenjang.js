"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class usulanNaikJenjang extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.pegawai, {
        foreignKey: "pegawaiId",
        as: "pegawai",
      });
    }
  }
  usulanNaikJenjang.init(
    {
      pegawaiId: DataTypes.INTEGER,
      nomorUsulan: DataTypes.STRING,
      linkSertifikat: DataTypes.STRING,
      formulir: DataTypes.STRING,
      ukom: DataTypes.STRING,
      SKPangkat: DataTypes.STRING,
      SKMutasi: DataTypes.STRING,
      SKJafung: DataTypes.STRING,
      SKP: DataTypes.STRING,
      STR: DataTypes.STRING,
      SIP: DataTypes.STRING,
      rekom: DataTypes.STRING,
      petaJabatan: DataTypes.STRING,
      catatan: DataTypes.STRING,
      status: DataTypes.ENUM("diusulkan", "ditolak", "diterima"),
    },
    {
      sequelize,
      modelName: "usulanNaikJenjang",
      tableName: "usulanNaikJenjangs", // Tambahkan ini untuk memastikan nama tabel yang benar
    }
  );
  return usulanNaikJenjang;
};
