"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Menambahkan kolom pertama
    await queryInterface.addColumn("kwitGlobals", "status", {
      type: Sequelize.ENUM("dibuat", "diajukan", "ditolak", "diterima"),
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Menghapus kolom kedua
    await queryInterface.removeColumn("kwitGlobals", "status");
  },
};
