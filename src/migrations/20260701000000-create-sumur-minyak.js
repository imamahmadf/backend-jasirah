"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("sumurMinyaks", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      nama: {
        type: Sequelize.STRING,
      },
      mitraId: {
        type: Sequelize.INTEGER,
      },
      foto: {
        type: Sequelize.STRING,
      },
      nomor: {
        type: Sequelize.STRING,
      },
      statusVerifikasi: {
        type: Sequelize.ENUM("sudah", "belum", "tidak"),
        defaultValue: "belum",
      },
      tanggalVerifikasi: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      longitude: {
        type: Sequelize.DECIMAL,
      },
      latitude: {
        type: Sequelize.DECIMAL,
      },
      alamat: {
        type: Sequelize.STRING,
      },
      produksiHarian: {
        type: Sequelize.DECIMAL,
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
    await queryInterface.dropTable("sumurMinyaks");
  },
};
