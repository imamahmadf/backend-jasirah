"use strict";

const constraintName = "fk-perjalanan-personil";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("personils", {
      fields: ["perjalananId"],
      type: "foreign key",
      name: constraintName,
      references: {
        //Required field
        table: "perjalanans",
        field: "id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("personils", constraintName);
  },
};
