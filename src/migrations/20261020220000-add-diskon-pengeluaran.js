"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("pengeluarans");

    if (!table.tipeDiskon) {
      await queryInterface.addColumn("pengeluarans", "tipeDiskon", {
        type: Sequelize.ENUM("nominal", "persen"),
        allowNull: true,
      });
    }

    if (!table.nilaiDiskon) {
      await queryInterface.addColumn("pengeluarans", "nilaiDiskon", {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: true,
      });
    }
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable("pengeluarans");
    if (table.nilaiDiskon) {
      await queryInterface.removeColumn("pengeluarans", "nilaiDiskon");
    }
    if (table.tipeDiskon) {
      await queryInterface.removeColumn("pengeluarans", "tipeDiskon");
    }
  },
};
