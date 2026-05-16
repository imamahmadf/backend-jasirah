"use strict";

const constraintName = "fk-dokumenBarjas-jenisDokumenBarjas";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("dokumenBarjas", {
      fields: ["jenisDokumenBarjasId"],
      type: "foreign key",
      name: constraintName,
      references: {
        //Required field
        table: "jenisDokumenBarjas",
        field: "id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("dokumenBarjas", constraintName);
  },
};
