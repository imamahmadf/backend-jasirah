"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("userKPBPNs");
    if (table.profilePic) return;

    await queryInterface.addColumn("userKPBPNs", "profilePic", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable("userKPBPNs");
    if (!table.profilePic) return;
    await queryInterface.removeColumn("userKPBPNs", "profilePic");
  },
};
