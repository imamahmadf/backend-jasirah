"use strict";

const constraintName = "fk-hasilKerjaPJPL-realisasiPJPL";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("hasilKerjaPJPLs", {
      fields: ["realisasiPJPLId"],
      type: "foreign key",
      name: constraintName,
      references: {
        //Required field
        table: "realisasiPJPLs",
        field: "id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("hasilKerjaPJPLs", constraintName);
  },
};
