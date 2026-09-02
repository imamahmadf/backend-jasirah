"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("sumurMinyaks", "longitude", {
      type: Sequelize.DECIMAL(11, 8),
      allowNull: true,
    });
    await queryInterface.changeColumn("sumurMinyaks", "latitude", {
      type: Sequelize.DECIMAL(11, 8),
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("sumurMinyaks", "longitude", {
      type: Sequelize.DECIMAL,
      allowNull: true,
    });
    await queryInterface.changeColumn("sumurMinyaks", "latitude", {
      type: Sequelize.DECIMAL,
      allowNull: true,
    });
  },
};
