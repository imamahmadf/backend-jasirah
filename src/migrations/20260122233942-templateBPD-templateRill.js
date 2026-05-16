"use strict";

const constraintName = "fk-templateBPD-templateRill";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("templateRills", {
      fields: ["templateBPDId"],
      type: "foreign key",
      name: constraintName,
      references: {
        //Required field
        table: "templateBPDs",
        field: "id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint(
      "templateRills",
      constraintName
    );
  },
};
