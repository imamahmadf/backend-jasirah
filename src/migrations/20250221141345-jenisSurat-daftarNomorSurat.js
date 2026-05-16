"use strict";

const constraintName = "fk-jenisSurat-daftarNomorSurat";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("daftarNomorSurats", {
      fields: ["jenisId"],
      type: "foreign key",
      name: constraintName,
      references: {
        //Required field
        table: "jenisSurats",
        field: "id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("daftarNomorSurats", constraintName);
  },
};
