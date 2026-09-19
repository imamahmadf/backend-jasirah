"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("icps");
    if (table.kursTengah) return;

    await queryInterface.addColumn("icps", "kursTengah", {
      type: Sequelize.DECIMAL(12, 2),
      allowNull: true,
    });
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable("icps");
    if (!table.kursTengah) return;
    await queryInterface.removeColumn("icps", "kursTengah");
  },
};
