"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Menambahkan kolom pertama
    await queryInterface.addColumn("capaians", "bukti", {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn("capaians", "status", {
      type: Sequelize.ENUM("pengajuan", "diterima", "ditolak"),
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Menghapus kolom kedua
    await queryInterface.removeColumn("capaians", "bukti");
    await queryInterface.removeColumn("capaians", "status");
  },
};
