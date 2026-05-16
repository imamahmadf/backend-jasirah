"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("realisasiKinerjaPJPLs", "hasil", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.addColumn("realisasiKinerjaPJPLs", "nilai", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.addColumn("realisasiKinerjaPJPLs", "buktiDukung", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("realisasiKinerjaPJPLs", "status", {
      type: Sequelize.ENUM("diajukan", "ditolak", "diterima"),
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("realisasiKinerjaPJPLs", "hasil");
    await queryInterface.removeColumn("realisasiKinerjaPJPLs", "nilai");
    await queryInterface.removeColumn("realisasiKinerjaPJPLs", "status");
    await queryInterface.removeColumn("realisasiKinerjaPJPLs", "buktiDukung");
  },
};
