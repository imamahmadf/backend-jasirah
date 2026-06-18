"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("tankis", "kapasitas", {
      type: Sequelize.INTEGER,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("tankis", "kapasitas");
  },
};
