"use strict";

const constraintName = "fk-targetTriwulan-namaTarget";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("targetTriwulans", {
      fields: ["namaTargetId"],
      type: "foreign key",
      name: constraintName,
      references: {
        //Required field
        table: "namaTargets",
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
