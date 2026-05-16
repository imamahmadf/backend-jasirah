"use strict";

const constraintName = "fk-sp-dokumenBarjas";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("dokumenBarjas", {
      fields: ["SPId"],
      type: "foreign key",
      name: constraintName,
      references: {
        //Required field
        table: "SPs",
        field: "id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("dokumenBarjas", constraintName);
  },
};
