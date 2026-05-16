"use strict";

const constraintName = "fk-ttdSuratTugas-perjalanan";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("perjalanans", {
      fields: ["ttdSuratTugasId"],
      type: "foreign key",
      name: constraintName,
      references: {
        //Required field
        table: "ttdSuratTugas",
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
