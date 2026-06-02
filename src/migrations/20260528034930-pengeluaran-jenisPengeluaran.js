"use strict";

const constraintName = "fk-pengeluaran-jenisPengeluaran";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("pengeluarans", {
      fields: ["jenisPengeluaranId"],
      type: "foreign key",
      name: constraintName,
      references: {
        //Required field
        table: "jenisPengeluarans",
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
