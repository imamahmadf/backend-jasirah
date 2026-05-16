"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Menambahkan kolom pertama
    await queryInterface.addColumn("kendaraans", "tanggalPerolehan", {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Menghapus kolom kedua
    await queryInterface.removeColumn("kendaraans", "tanggalPerolehan");
  },
};
