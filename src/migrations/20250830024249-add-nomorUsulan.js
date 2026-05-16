"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Menambahkan kolom pertama
    await queryInterface.addColumn("usulanPegawais", "nomorUsulan", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("usulanPegawais", "laporanUsulanPegawaiId", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Menghapus kolom kedua
    await queryInterface.removeColumn("usulanPegawais", "nomorUsulan");
    await queryInterface.removeColumn(
      "usulanPegawais",
      "laporanUsulanPegawaiId"
    );
  },
};
