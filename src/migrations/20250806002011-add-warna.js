"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Menambahkan kolom pertama
    await queryInterface.addColumn("kendaraans", "warna", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("kendaraans", "merek", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Menghapus kolom kedua
    await queryInterface.removeColumn("kendaraans", "warna");
    await queryInterface.removeColumn("kendaraans", "merek");
  },
};
