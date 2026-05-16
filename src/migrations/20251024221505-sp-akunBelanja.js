"use strict";

const constraintName = "fk-sp-akunBelanja";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("SPs", {
      fields: ["akunBelanjaId"],
      type: "foreign key",
      name: constraintName,
      references: {
        //Required field
        table: "akunBelanjas",
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
