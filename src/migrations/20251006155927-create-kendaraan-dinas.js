"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("kendaraanDinas", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      // tanggalAwal: {
      //   type: Sequelize.DATE,
      // },
      // tanggalAkhir: {
      //   type: Sequelize.DATE,
      // },
      kendaraanId: {
        type: Sequelize.INTEGER,
      },
      // pegawaiId: {
      //   type: Sequelize.INTEGER,
      // },
      // perjalananId: {
      //   type: Sequelize.INTEGER,
      // },
      // tujuan: {
      //   type: Sequelize.STRING,
      // },

      kmAkhir: {
        type: Sequelize.STRING,
      },

      kondisiAkhir: {
        type: Sequelize.STRING,
      },
      catatan: {
        type: Sequelize.STRING,
      },
      keterangan: {
        type: Sequelize.STRING,
      },
      // unitKerjaId: {
      //   type: Sequelize.INTEGER,
      // },
      jarak: {
        type: Sequelize.INTEGER,
      },
      status: {
        type: Sequelize.ENUM("dipinjam", "kembali"),
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },

      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("kendaraanDinas");
  },
};
