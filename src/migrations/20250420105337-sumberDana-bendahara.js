"use strict";

const constraintName = "fk-sumberDana-bendahara";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("bendaharas", {
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
    await queryInterface.removeConstraint("bendaharas", constraintName);
  },
};
