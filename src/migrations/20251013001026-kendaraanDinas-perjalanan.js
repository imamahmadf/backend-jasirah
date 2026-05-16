"use strict";

const constraintName = "fk-kendaraanDinas-perjalanan";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("perjalanans", {
      fields: ["kendaraanDinasId"],
      type: "foreign key",
      name: constraintName,
      references: {
        //Required field
        table: "kendaraanDinas",
        field: "id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("perjalanans", constraintName);
  },
};
