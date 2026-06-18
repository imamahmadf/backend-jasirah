"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("suratJalans", "jamDatang", {
      type: Sequelize.TIME,
      allowNull: true,
    });
    await queryInterface.addColumn("suratJalans", "jamPergi", {
      type: Sequelize.TIME,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("suratJalans", "jamDatang");
    await queryInterface.removeColumn("suratJalans", "jamPergi");
  },
};
