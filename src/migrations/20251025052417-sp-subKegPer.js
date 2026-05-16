"use strict";

const constraintName = "fk-sp-subKegPer";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("SPs", {
      fields: ["subKegPerId"],
      type: "foreign key",
      name: constraintName,
      references: {
        //Required field
        table: "subKegPers",
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
