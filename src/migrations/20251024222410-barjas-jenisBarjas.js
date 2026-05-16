"use strict";

const constraintName = "fk-barjas-jenisBarjas";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("barjas", {
      fields: ["jenisBarjasId"],
      type: "foreign key",
      name: constraintName,
      references: {
        //Required field
        table: "jenisBarjas",
        field: "id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("barjas", constraintName);
  },
};
