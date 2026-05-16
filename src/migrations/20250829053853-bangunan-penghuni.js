"use strict";

const constraintName = "fk-bangunan-penghuni";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("penghunis", {
      fields: ["bangunanId"],
      type: "foreign key",
      name: constraintName,
      references: {
        //Required field
        table: "bangunans",
        field: "id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("penghunis", constraintName);
  },
};
