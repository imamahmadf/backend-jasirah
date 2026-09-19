"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("produksiSumurs", "produksi", {
      type: Sequelize.DECIMAL(10, 3),
      allowNull: true,
    });

    await queryInterface.changeColumn("produksiSumurK3S", "produksi", {
      type: Sequelize.DECIMAL(10, 3),
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("produksiSumurs", "produksi", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.changeColumn("produksiSumurK3S", "produksi", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  },
};
