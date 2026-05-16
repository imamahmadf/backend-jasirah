"use strict";

const constraintName = "fk-dalamKota-tempat";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("tempats", {
      fields: ["dalamKotaId"],
      type: "foreign key",
      name: constraintName,
      references: {
        //Required field
        table: "dalamKota",
        field: "id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("tempats", constraintName);
  },
};
