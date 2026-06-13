"use strict";

const constraintName = "fk-supir-mitra";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("supirs", {
      fields: ["mitraId"],
      type: "foreign key",
      name: constraintName,
      references: {
        //Required field
        table: "mitras",
        field: "id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("supirs", constraintName);
  },
};
