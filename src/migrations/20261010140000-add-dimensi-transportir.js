"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("transportirs", "panjang", {
      type: Sequelize.DECIMAL(10, 3),
      allowNull: true,
    });

    await queryInterface.addColumn("transportirs", "lebar", {
      type: Sequelize.DECIMAL(10, 3),
      allowNull: true,
    });

    await queryInterface.addColumn("transportirs", "tinggi", {
      type: Sequelize.DECIMAL(10, 3),
      allowNull: true,
    });

    await queryInterface.addColumn("transportirs", "factorTank", {
      type: Sequelize.DECIMAL(10, 3),
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("transportirs", "panjang");
    await queryInterface.removeColumn("transportirs", "lebar");
    await queryInterface.removeColumn("transportirs", "tinggi");
    await queryInterface.removeColumn("transportirs", "factorTank");
  },
};
