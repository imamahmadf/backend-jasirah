"use strict";

const constraintName = "fk-riwayatPegawai-profesi";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("riwayatPegawais", {
      fields: ["profesiLamaId"],
      type: "foreign key",
      name: constraintName,
      references: {
        //Required field
        table: "profesis",
        field: "id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("riwayatPegawais", constraintName);
  },
};
