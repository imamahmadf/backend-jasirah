"use strict";

const constraintName = "fk-riwayatPegawai-golongan";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("riwayatPegawais", {
      fields: ["golonganId"],
      type: "foreign key",
      name: constraintName,
      references: {
        //Required field
        table: "daftarGolongans",
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
