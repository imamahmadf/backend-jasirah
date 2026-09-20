"use strict";

const tableName = "konfirmasiPenerimaans";
const columnName = "jamKedatangan";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable(tableName);
    if (table[columnName]) return;

    await queryInterface.addColumn(tableName, columnName, {
      type: Sequelize.TIME,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable(tableName);
    if (!table[columnName]) return;

    await queryInterface.removeColumn(tableName, columnName);
  },
};
