"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("pengajuanBarjasKpbpns");
    if (table.kodeQr) return;

    await queryInterface.addColumn("pengajuanBarjasKpbpns", "kodeQr", {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true,
    });
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable("pengajuanBarjasKpbpns");
    if (!table.kodeQr) return;
    await queryInterface.removeColumn("pengajuanBarjasKpbpns", "kodeQr");
  },
};
