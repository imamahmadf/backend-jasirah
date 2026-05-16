"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Menambahkan kolom pertama
    await queryInterface.addColumn("kadis", "templateSPD", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Menghapus kolom kedua
    await queryInterface.removeColumn("kadis", "templateSPD");
  },
};
