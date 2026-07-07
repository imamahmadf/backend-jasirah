"use strict";

const constraintName = "fk-mitra-jenisMitra";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("mitras", {
      fields: ["jenisMitraId"],
      type: "foreign key",
      name: constraintName,
      references: {
        //Required field
        table: "jenisMitras",
        field: "id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("mitras", constraintName);
  },
};
