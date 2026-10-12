"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("konfirmasiPenerimaans", "tinggiCairan", {
      type: Sequelize.DECIMAL(10, 3),
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("konfirmasiPenerimaans", "tinggiCairan");
  },
};
