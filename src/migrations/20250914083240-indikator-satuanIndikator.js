"use strict";

const constraintName = "fk-idnikator-satuanIndikator";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("indikators", {
      fields: ["satuanIndikatorId"],
      type: "foreign key",
      name: constraintName,
      references: {
        //Required field
        table: "satuanIndikators",
        field: "id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("indikators", constraintName);
  },
};
