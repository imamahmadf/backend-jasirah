"use strict";

const constraintName = "fk-riwayatPegawai-pangkat";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("riwayatPegawais", {
      fields: ["pangkatId"],
      type: "foreign key",
      name: constraintName,
      references: {
        //Required field
        table: "daftarPangkats",
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
