"use strict";
/** @type {import('import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("stokKeluars", "tanggal", {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("stokKeluars", "tanggal", {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },
};
