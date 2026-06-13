"use strict";

const constraintName = "fk-suratJalan-supir";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("suratJalans", {
      fields: ["supirId"],
      type: "foreign key",
      name: constraintName,
      references: {
        //Required field
        table: "supirs",
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
