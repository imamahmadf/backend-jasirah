"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("tankis", "panjang", {
      type: Sequelize.DECIMAL(10, 3),
      allowNull: true,
    });

    await queryInterface.addColumn("tankis", "lebar", {
      type: Sequelize.DECIMAL(10, 3),
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("tankis", "panjang");
    await queryInterface.removeColumn("tankis", "lebar");
  },
};
