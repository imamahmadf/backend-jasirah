"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("indikators", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      indikator: {
        type: Sequelize.STRING,
      },
      satuanIndikatorId: {
        type: Sequelize.INTEGER,
      },
      subKegPerId: {
        type: Sequelize.INTEGER,
      },
      kegiatanId: {
        type: Sequelize.INTEGER,
      },
      programId: {
        type: Sequelize.INTEGER,
      },
      status: {
        type: Sequelize.ENUM("aktif", "nonaktif"),
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
    await queryInterface.dropTable("indikators");
  },
};
