"use strict";

const constraintName = "fk-laporanUsulanPegawai-usulanPegawai";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("usulanPegawais", {
      fields: ["laporanUsulanPegawaiId"],
      type: "foreign key",
      name: constraintName,
      references: {
        //Required field
        table: "laporanUsulanPegawais",
        field: "id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("usulanPegawais", constraintName);
  },
};
