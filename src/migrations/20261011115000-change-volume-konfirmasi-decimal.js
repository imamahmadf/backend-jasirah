"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("konfirmasiPenerimaans", "volume", {
      type: Sequelize.DECIMAL(10, 3),
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("konfirmasiPenerimaans", "volume", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  },
};
