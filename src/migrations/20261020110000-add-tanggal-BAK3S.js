"use strict";

const tableName = "BAK3S";
const columnName = "tanggal";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable(tableName);
    if (!table[columnName]) {
      await queryInterface.addColumn(tableName, columnName, {
        type: Sequelize.DATE,
        allowNull: true,
      });
    }

    await queryInterface.sequelize.query(`
      UPDATE BAK3S AS b
      INNER JOIN BABongkars AS ba ON ba.id = b.BABongkarId
      SET b.tanggal = ba.tanggal
      WHERE b.tanggal IS NULL
    `);
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable(tableName);
    if (!table[columnName]) return;
    await queryInterface.removeColumn(tableName, columnName);
  },
};
