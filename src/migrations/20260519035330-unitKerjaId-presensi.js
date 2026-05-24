"use strict";

const constraintName = "fk-unitKerja-presensi";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("presensis", {
      fields: ["unitKerjaId"],
      type: "foreign key",
      name: constraintName,
      references: {
        //Required field
        table: "daftarUnitKerjas",
        field: "id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("presensis", constraintName);
  },
};
