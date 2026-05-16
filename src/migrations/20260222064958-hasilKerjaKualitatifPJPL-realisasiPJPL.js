"use strict";

const constraintName = "fk-hasilKerjaKualitatifPJPL-realisasiPJPL";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("hasilKerjaKualitatifPJPLs", {
      fields: ["realisasiPJPLId"],
      type: "foreign key",
      name: constraintName,
      references: {
        table: "realisasiPJPLs",
        field: "id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint(
      "hasilKerjaKualitatifPJPLs",
      constraintName,
    );
  },
};
