"use strict";

const constraintName = "fk-pejabatVerifikator-indikatorPejabat";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("indikatorPejabats", {
      fields: ["pejabatVerifikatorId"],
      type: "foreign key",
      name: constraintName,
      references: {
        //Required field
        table: "pejabatVerifikators",
        field: "id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("indikatorPejabats", constraintName);
  },
};
