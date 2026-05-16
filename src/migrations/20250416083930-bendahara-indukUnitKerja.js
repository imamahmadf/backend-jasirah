"use strict";

const constraintName = "fk-bendahara-indukUnitKerja";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("bendaharas", {
      fields: ["indukUnitKerjaId"],
      type: "foreign key",
      name: constraintName,
      references: {
        //Required field
        table: "indukUnitKerjas",
        field: "id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("bendaharas", constraintName);
  },
};
