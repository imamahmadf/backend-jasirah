"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Menambahkan kolom pertama
    await queryInterface.addColumn("mutasiKendaraans", "asalUnitKerjaId", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    // Menambahkan kolom kedua
    await queryInterface.addColumn("mutasiKendaraans", "asalPegawaiId", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Menghapus kolom kedua
    await queryInterface.removeColumn("mutasiKendaraans", "asalUnitKerjaId");
    // Menghapus kolom pertama
    await queryInterface.removeColumn("mutasiKendaraans", "asalPegawaiId");
  },
};
