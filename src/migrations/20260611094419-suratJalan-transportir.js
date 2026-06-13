"use strict";

const constraintName = "fk-suratJalan-trnsportir";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("suratJalans", {
      fields: ["transportirId"],
      type: "foreign key",
      name: constraintName,
      references: {
        //Required field
        table: "transportirs",
        field: "id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("suratJalans", constraintName);
  },
};
