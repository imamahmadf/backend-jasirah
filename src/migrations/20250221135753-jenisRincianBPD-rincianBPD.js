"use strict";

const constraintName = "fk-jenisRincianBPD-rincianBPD";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("rincianBPDs", {
      fields: ["jenisId"],
      type: "foreign key",
      name: constraintName,
      references: {
        //Required field
        table: "jenisRincianBPDs",
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
