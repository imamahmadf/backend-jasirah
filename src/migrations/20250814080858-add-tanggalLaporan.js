"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Menambahkan kolom pertama
    await queryInterface.addColumn("laporanPersediaans", "tanggalAwal", {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addColumn("laporanPersediaans", "tanggalAkhir", {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Menghapus kolom kedua
    await queryInterface.removeColumn("laporanPersediaans", "tanggalAwal"),
      await queryInterface.removeColumn("laporanPersediaans", "tanggalAkhir");
  },
};
