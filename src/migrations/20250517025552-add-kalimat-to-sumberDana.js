"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("sumberDanas", "kalimat1", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("sumberDanas", "kalimat2", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("sumberDanas", "kalimat1");
    await queryInterface.removeColumn("sumberDanas", "kalimat2");
  },
};
