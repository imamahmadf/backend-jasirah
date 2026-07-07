"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("daftarUnitKerjas", "status", {
      type: Sequelize.ENUM("gudang", "non-gudang"),
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("daftarUnitKerjas", "status");
  },
};
