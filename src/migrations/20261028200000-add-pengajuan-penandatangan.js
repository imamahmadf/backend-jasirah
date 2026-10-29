"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("pengajuanBarjasKpbpns");
    const kolom = {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "userKPBPNs",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    };

    if (!table.mengetahuiId) {
      await queryInterface.addColumn("pengajuanBarjasKpbpns", "mengetahuiId", kolom);
    }
    if (!table.menyetujuiId) {
      await queryInterface.addColumn("pengajuanBarjasKpbpns", "menyetujuiId", kolom);
    }
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable("pengajuanBarjasKpbpns");
    if (table.menyetujuiId) {
      await queryInterface.removeColumn("pengajuanBarjasKpbpns", "menyetujuiId");
    }
    if (table.mengetahuiId) {
      await queryInterface.removeColumn("pengajuanBarjasKpbpns", "mengetahuiId");
    }
  },
};
