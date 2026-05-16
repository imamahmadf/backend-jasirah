"use strict";

const constraintName = "fk-nomorSuratKeluar-perjalanan";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("perjalanans", {
      fields: ["nomorSuratKeluarId"],
      type: "foreign key",
      name: constraintName,
      references: {
        //Required field
        table: "suratKeluars",
        field: "id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("perjalanans", constraintName);
  },
};
