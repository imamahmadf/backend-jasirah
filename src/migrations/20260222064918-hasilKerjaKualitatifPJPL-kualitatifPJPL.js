"use strict";

const constraintName = "fk-hasilKerjaKualitatifPJPL-kualitatifPJPL";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("hasilKerjaKualitatifPJPLs", {
      fields: ["kualitatifPJPLId"],
      type: "foreign key",
      name: constraintName,
      references: {
        table: "kualitatifPJPLs",
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
