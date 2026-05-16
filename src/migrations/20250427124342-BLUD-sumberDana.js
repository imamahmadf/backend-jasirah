"use strict";

const constraintName = "fk-BLUD-sumberDana";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("sumberDanas", {
      fields: ["BLUDId"],
      type: "foreign key",
      name: constraintName,
      references: {
        //Required field
        table: "BLUDs",
        field: "id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("sumberDanas", constraintName);
  },
};
