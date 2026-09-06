"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("stockOpnameTankis", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      tinggiMinyak: {
        type: Sequelize.DECIMAL(10, 3),
      },
      tinggiAir: {
        type: Sequelize.DECIMAL(10, 3),
      },
      tanggal: {
        type: Sequelize.DATE,
      },
      tankiId: {
        type: Sequelize.INTEGER,
      },
      suhu: {
        type: Sequelize.DECIMAL(10, 3),
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
    await queryInterface.dropTable("stockOpnameTankis");
  },
};
