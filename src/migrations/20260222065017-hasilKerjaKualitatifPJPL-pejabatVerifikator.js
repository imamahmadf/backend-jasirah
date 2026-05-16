"use strict";

const constraintName = "fk-hasilKerjaKualitatifPJPL-pejabatVerifikator";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("hasilKerjaKualitatifPJPLs", {
      fields: ["pejabatVerifikatorId"],
      type: "foreign key",
      name: constraintName,
      references: {
        table: "pejabatVerifikators",
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
