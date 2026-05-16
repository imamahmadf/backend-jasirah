"use strict";

const constraintName = "fk-sp-rekanan";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("SPs", {
      fields: ["rekananId"],
      type: "foreign key",
      name: constraintName,
      references: {
        //Required field
        table: "rekanans",
        field: "id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("SPs", constraintName);
  },
};
