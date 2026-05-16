"use strict";

const constraintName = "fk-kinerjaPJPL-kontrakPJPL";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("kinerjaPJPLs", {
      fields: ["kontrakPJPLId"],
      type: "foreign key",
      name: constraintName,
      references: {
        //Required field
        table: "kontrakPJPLs",
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
