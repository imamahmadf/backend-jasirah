"use strict";

const constraintName = "fk-BAPenerimaan-pengisianTanki";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("pengisianTankis", {
      fields: ["BAPenerimaanId"],
      type: "foreign key",
      name: constraintName,
      references: {
        //Required field
        table: "BAPenerimaans",
        field: "id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("pengisianTankis", constraintName);
  },
};
