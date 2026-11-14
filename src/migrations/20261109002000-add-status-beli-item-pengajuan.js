"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("itemPengajuanBarjasKpbpns");
    if (table.statusBeli) return;
    await queryInterface.addColumn("itemPengajuanBarjasKpbpns", "statusBeli", {
      type: Sequelize.STRING(20),
      allowNull: false,
      defaultValue: "belum",
    });
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable("itemPengajuanBarjasKpbpns");
    if (!table.statusBeli) return;
    await queryInterface.removeColumn("itemPengajuanBarjasKpbpns", "statusBeli");
  },
};
