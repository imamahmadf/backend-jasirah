"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("stockOpnameTankis", "tinggiMinyak", {
      type: Sequelize.DECIMAL(10, 3),
    });
    await queryInterface.changeColumn("stockOpnameTankis", "tinggiAir", {
      type: Sequelize.DECIMAL(10, 3),
    });
    await queryInterface.changeColumn("stockOpnameTankis", "suhu", {
      type: Sequelize.DECIMAL(10, 3),
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("stockOpnameTankis", "tinggiMinyak", {
      type: Sequelize.DECIMAL,
    });
    await queryInterface.changeColumn("stockOpnameTankis", "tinggiAir", {
      type: Sequelize.DECIMAL,
    });
    await queryInterface.changeColumn("stockOpnameTankis", "suhu", {
      type: Sequelize.DECIMAL,
    });
  },
};
