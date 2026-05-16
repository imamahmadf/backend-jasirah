"use strict";

const constraintName = "fk-bangunan-kondisiBangunan";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("bangunans", {
      fields: ["kondisiBangunanId"],
      type: "foreign key",
      name: constraintName,
      references: {
        //Required field
        table: "kondisiBangunans",
        field: "id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("bangunans", constraintName);
  },
};
