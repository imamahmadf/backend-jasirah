"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("usulanNaikJenjangs", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      pegawaiId: {
        type: Sequelize.INTEGER,
      },
      nomorUsulan: {
        type: Sequelize.STRING,
      },
      linkSertifikat: {
        type: Sequelize.STRING,
      },
      formulir: {
        type: Sequelize.STRING,
      },
      ukom: {
        type: Sequelize.STRING,
      },
      SKPangkat: {
        type: Sequelize.STRING,
      },
      SKMutasi: {
        type: Sequelize.STRING,
      },
      SKJafung: {
        type: Sequelize.STRING,
      },
      SKP: {
        type: Sequelize.STRING,
      },
      STR: {
        type: Sequelize.STRING,
      },
      SIP: {
        type: Sequelize.STRING,
      },
      rekom: {
        type: Sequelize.STRING,
      },
      petaJabatan: {
        type: Sequelize.STRING,
      },
      catatan: {
        type: Sequelize.STRING,
      },
      status: {
        type: Sequelize.ENUM("diusulkan", "ditolak", "diterima"),
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
    await queryInterface.dropTable("usulanNaikJenjangs");
  },
};
