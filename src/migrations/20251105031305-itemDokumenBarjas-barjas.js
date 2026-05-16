"use strict";

const constraintName = "fk-itemDokumenBarjas-barjas";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("itemDokumenBarjas", {
      fields: ["barjasId"],
      type: "foreign key",
      name: constraintName,
      references: {
        //Required field
        table: "barjas",
        field: "id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("itemDokumenBarjas", constraintName);
  },
};
