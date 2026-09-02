"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("konfirmasiPenerimaans", "api", {
      type: Sequelize.DECIMAL(10, 3),
      allowNull: true,
    });
    await queryInterface.addColumn("konfirmasiPenerimaans", "BSNW", {
      type: Sequelize.DECIMAL(10, 3),
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("konfirmasiPenerimaans", "BSNW");
    await queryInterface.removeColumn("konfirmasiPenerimaans", "api");
  },
};
