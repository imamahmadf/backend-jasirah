"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("stokMasuks", "mutasiPersediaanId", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.addColumn("stokMasuks", "stokMasukAsalId", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("stokMasuks", "stokMasukAsalId");
    await queryInterface.removeColumn("stokMasuks", "mutasiPersediaanId");
  },
};
