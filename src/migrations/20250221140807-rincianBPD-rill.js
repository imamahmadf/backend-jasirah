"use strict";

const constraintName = "fk-rincianBPD-rill";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("rills", {
      fields: ["rincianBPDId"],
      type: "foreign key",
      name: constraintName,
      references: {
        //Required field
        table: "rincianBPDs",
        field: "id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("rills", constraintName);
  },
};
