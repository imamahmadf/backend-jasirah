"use strict";

const constraintName = "fk-idnikator-subKegPer";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("indikators", {
      fields: ["subKegPerId"],
      type: "foreign key",
      name: constraintName,
      references: {
        //Required field
        table: "subKegPers",
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
