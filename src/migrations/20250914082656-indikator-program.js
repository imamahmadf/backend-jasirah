"use strict";

const constraintName = "fk-idnikator-program";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("indikators", {
      fields: ["programId"],
      type: "foreign key",
      name: constraintName,
      references: {
        //Required field
        table: "programs",
        field: "id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("indikators", constraintName);
  },
};
