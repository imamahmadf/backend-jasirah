"use strict";

const constraintName = "fk-suratJalan-statusSuratJalan";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("suratJalans", {
      fields: ["statusSuratJalanId"],
      type: "foreign key",
      name: constraintName,
      references: {
        //Required field
        table: "statusSuratJalans",
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
