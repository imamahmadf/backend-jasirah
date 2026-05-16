"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("indukUnitKerjas", "keuangan", {
      type: Sequelize.ENUM("aktif", "nonaktif"),
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("indukUnitKerjas", "keuangan");
  },
};
