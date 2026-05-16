"use strict";

const constraintName = "fk-personil-rincianBPD";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("rincianBPDs", {
      fields: ["personilId"],
      type: "foreign key",
      name: constraintName,
      references: {
        //Required field
        table: "personils",
        field: "id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("rincianBPDs", constraintName);
  },
};
