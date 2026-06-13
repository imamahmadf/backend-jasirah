"use strict";

const constraintName = "fk-tanki-unitKerja";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("tankis", {
      fields: ["unitKerjaId"],
      type: "foreign key",
      name: constraintName,
      references: {
        //Required field
        table: "daftarUnitKerjas",
        field: "id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("tankis", constraintName);
  },
};
