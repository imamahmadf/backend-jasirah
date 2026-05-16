"use strict";

const constraintName = "fk-jenisRill-rill";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("rills", {
      fields: ["jenisId"],
      type: "foreign key",
      name: constraintName,
      references: {
        //Required field
        table: "jenisRills",
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
