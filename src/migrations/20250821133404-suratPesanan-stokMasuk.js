"use strict";

const constraintName = "fk-suratPesanan-stokMasuk";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("stokMasuks", {
      fields: ["suratPesananId"],
      type: "foreign key",
      name: constraintName,
      references: {
        //Required field
        table: "suratPesanans",
        field: "id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("stokMasuks", constraintName);
  },
};
