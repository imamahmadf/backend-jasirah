"use strict";

const constraintName = "fk-nomorSP-indukUnitKerja";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("nomorSPs", {
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
    await queryInterface.removeConstraint("nomorSPs", constraintName);
  },
};
