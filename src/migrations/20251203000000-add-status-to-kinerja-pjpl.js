"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("kinerjaPJPLs", "status", {
      type: Sequelize.ENUM("diajukan", "ditolak", "diterima"),
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("kinerjaPJPLs", "status");
  },
};
