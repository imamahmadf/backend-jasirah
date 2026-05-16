"use strict";

const constraintName = "fk-itemDokumenBarjas-dokumenBarjas";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("itemDokumenBarjas", {
      fields: ["dokumenBarjasId"],
      type: "foreign key",
      name: constraintName,
      references: {
        //Required field
        table: "dokumenBarjas",
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
