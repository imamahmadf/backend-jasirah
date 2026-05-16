"use strict";

const constraintName = "fk-kinerjaPJPL-indikatorPejabat";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("kinerjaPJPLs", {
      fields: ["indikatorPejabatId"],
      type: "foreign key",
      name: constraintName,
      references: {
        //Required field
        table: "indikatorPejabats",
        field: "id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("kinerjaPJPLs", constraintName);
  },
};
