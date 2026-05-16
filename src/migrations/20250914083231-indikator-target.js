"use strict";

const constraintName = "fk-idnikator-target";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("targets", {
      fields: ["indikatorId"],
      type: "foreign key",
      name: constraintName,
      references: {
        //Required field
        table: "indikators",
        field: "id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("targets", constraintName);
  },
};
