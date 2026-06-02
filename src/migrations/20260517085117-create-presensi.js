"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("presensis", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      pegawaiId: {
        type: Sequelize.INTEGER,
      },
      jamMasuk: {
        type: Sequelize.DATE,
      },
      jamPulang: {
        type: Sequelize.DATE,
      },
      latitudeMasuk: {
        type: Sequelize.DECIMAL,
      },
      longitudeMasuk: {
        type: Sequelize.DECIMAL,
      },
      latitudePulang: {
        type: Sequelize.DECIMAL,
      },
      longitudePulang: {
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
    await queryInterface.dropTable("presensis");
  },
};
