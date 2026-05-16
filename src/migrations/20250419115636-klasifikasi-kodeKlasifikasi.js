"use strict";

const constraintName = "fk-kalsifikasi-kodeKlasifikasi";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("kodeKlasifikasis", {
      fields: ["klasifikasiId"],
      type: "foreign key",
      name: constraintName,
      references: {
        //Required field
        table: "klasifikasis",
        field: "id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("kodeKlasifikasis", constraintName);
  },
};
