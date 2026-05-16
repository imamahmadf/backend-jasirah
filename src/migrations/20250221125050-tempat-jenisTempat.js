"use strict";

const constraintName = "fk-jenisTempat-tempat";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("tempats", {
      fields: ["jenisId"],
      type: "foreign key",
      name: constraintName,
      references: {
        //Required field
        table: "jenisTempats",
        field: "id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("tempats", constraintName);
  },
};
