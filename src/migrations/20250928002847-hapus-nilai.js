"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn("targets", "target");
    await queryInterface.removeColumn("targets", "nilai");
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn("targets", "target", {
      type: Sequelize.STRING,
    });
    await queryInterface.addColumn("targets", "nilai", {
      type: Sequelize.BIGINT,
    });
  },
};
