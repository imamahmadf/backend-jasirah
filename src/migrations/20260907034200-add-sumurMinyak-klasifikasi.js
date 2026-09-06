"use strict";

const columns = [
  "area",
  "operasional",
  "lingkungan",
  "penyaluran",
  "statusKepemilikan",
  "tingkatProduksi",
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    for (const column of columns) {
      await queryInterface.addColumn("sumurMinyaks", column, {
        type: Sequelize.INTEGER,
        allowNull: true,
      });
    }
  },

  async down(queryInterface) {
    for (const column of [...columns].reverse()) {
      await queryInterface.removeColumn("sumurMinyaks", column);
    }
  },
};
