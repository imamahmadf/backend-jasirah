"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Tambahkan kolom deletedAt ke tabel subKegPers
    await queryInterface.addColumn("subKegPers", "deletedAt", {
      type: Sequelize.DATE,
      allowNull: true,
    });

    // Tambahkan kolom deletedAt ke tabel kegiatans
    await queryInterface.addColumn("kegiatans", "deletedAt", {
      type: Sequelize.DATE,
      allowNull: true,
    });

    // Tambahkan kolom deletedAt ke tabel programs
    await queryInterface.addColumn("programs", "deletedAt", {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    // Hapus kolom deletedAt dari tabel programs
    await queryInterface.removeColumn("programs", "deletedAt");

    // Hapus kolom deletedAt dari tabel kegiatans
    await queryInterface.removeColumn("kegiatans", "deletedAt");

    // Hapus kolom deletedAt dari tabel subKegPers
    await queryInterface.removeColumn("subKegPers", "deletedAt");
  },
};
