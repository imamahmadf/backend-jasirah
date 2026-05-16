"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("pegawais", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      nama: {
        type: Sequelize.STRING,
      },
      nip: {
        type: Sequelize.STRING,
      },
      tingkatanId: {
        type: Sequelize.INTEGER,
      },
      pangkatId: {
        type: Sequelize.INTEGER,
      },
      golonganId: {
        type: Sequelize.INTEGER,
      },
      jabatan: {
        type: Sequelize.STRING,
      },
      nomorRekening: {
        type: Sequelize.STRING,
      },
      pendidikan: {
        type: Sequelize.STRING,
      },
      unitKerjaId: {
        type: Sequelize.INTEGER,
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
    await queryInterface.dropTable("pegawais");
  },
};
