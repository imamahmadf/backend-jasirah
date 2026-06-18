"use strict";

const constraintName = "fk-transportir-jenisTransportir";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("transportirs", {
      fields: ["jenisTransportirId"],
      type: "foreign key",
      name: constraintName,
      references: {
        //Required field
        table: "jenisTransportirs",
        field: "id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("transportirs", constraintName);
  },
};
