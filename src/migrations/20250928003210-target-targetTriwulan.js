"use strict";

const constraintName = "fk-target-targetTriwulan";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("targetTriwulans", {
      fields: ["targetId"],
      type: "foreign key",
      name: constraintName,
      references: {
        //Required field
        table: "targets",
        field: "id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("targetTriwulans", constraintName);
  },
};
