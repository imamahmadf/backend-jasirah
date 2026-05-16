"use strict";

const constraintName = "fk-indukUKSumberDana-sumberDana";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("indukUKSumberDanas", {
      fields: ["sumberDanaId"],
      type: "foreign key",
      name: constraintName,
      references: {
        //Required field
        table: "sumberDanas",
        field: "id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("indukUKSumberDanas", constraintName);
  },
};
