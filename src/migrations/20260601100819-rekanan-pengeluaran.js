"use strict";

const constraintName = "fk-rekanan-pengeluaran";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("pengeluarans", {
      fields: ["rekananId"],
      type: "foreign key",
      name: constraintName,
      references: {
        //Required field
        table: "rekanans",
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
