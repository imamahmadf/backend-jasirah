"use strict";

const constraintName = "fk-suratPengantar-user";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("suratPengantars", {
      fields: ["userId"],
      type: "foreign key",
      name: constraintName,
      references: {
        //Required field
        table: "users",
        field: "id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("suratPengantars", constraintName);
  },
};
