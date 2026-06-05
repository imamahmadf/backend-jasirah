"use strict";

const constraintName = "fk-pengeluaran-stokMasuk";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("stokMasuks", {
      fields: ["pengeluaranId"],
      type: "foreign key",
      name: constraintName,
      references: {
        //Required field
        table: "pengeluarans",
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
