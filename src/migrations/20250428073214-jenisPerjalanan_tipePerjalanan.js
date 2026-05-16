"use strict";

const constraintName = "fk-jenisPerjalanan-tipePerjalanan";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("jenisPerjalanans", {
      fields: ["tipePerjalananId"],
      type: "foreign key",
      name: constraintName,
      references: {
        //Required field
        table: "tipePerjalanans",
        field: "id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("jenisPerjalanans", constraintName);
  },
};
