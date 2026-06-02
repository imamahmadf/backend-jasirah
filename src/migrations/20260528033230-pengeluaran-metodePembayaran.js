"use strict";

const constraintName = "fk-pengeluaran-metodePembayaran";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("pengeluarans", {
      fields: ["metodePembayaranId"],
      type: "foreign key",
      name: constraintName,
      references: {
        //Required field
        table: "metodePembayarans",
        field: "id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("pengeluarans", constraintName);
  },
};
