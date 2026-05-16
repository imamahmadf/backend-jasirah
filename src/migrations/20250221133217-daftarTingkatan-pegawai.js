"use strict";

const constraintName = "fk-daftarTingkatan-pegawai";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("pegawais", {
      fields: ["tingkatanId"],
      type: "foreign key",
      name: constraintName,
      references: {
        //Required field
        table: "daftarTingkatans",
        field: "id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("pegawais", constraintName);
  },
};
