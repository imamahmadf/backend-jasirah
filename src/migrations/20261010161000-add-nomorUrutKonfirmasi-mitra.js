"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("mitras", "nomorUrutKonfirmasi", {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 0,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("mitras", "nomorUrutKonfirmasi");
  },
};
