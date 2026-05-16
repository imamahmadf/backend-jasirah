"use strict";

const constraintName = "fk-status-personil";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("personils", {
      fields: ["statusId"],
      type: "foreign key",
      name: constraintName,
      references: {
        //Required field
        table: "statuses",
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
