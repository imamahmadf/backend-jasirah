"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "bendaharas",
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        pegawaiId: {
          type: Sequelize.INTEGER,
        },
        indukUnitKerjaId: {
          type: Sequelize.INTEGER,
        },
        sumberDanaId: {
          type: Sequelize.INTEGER,
        },
        jabatan: {
          type: Sequelize.STRING,
        },
        deletedAt: {
          type: Sequelize.DATE,
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
      },
      {
        paranoid: true,
        deletedAt: "soft_delete",
      }
    );
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("bendaharas");
  },
};
