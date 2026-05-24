"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Menambahkan kolom pertama
    await queryInterface.addColumn("pegawais", "gajiPokok", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Menghapus kolom kedua
    await queryInterface.removeColumn("pegawais", "gajiPokok");
  },
};
