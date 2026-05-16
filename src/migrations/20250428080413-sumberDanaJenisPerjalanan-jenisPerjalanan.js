"use strict";

const constraintName = "fk-sumberDanaJenisPerjalanan-jenisPerjalanan";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("sumberDanaJenisPerjalanans", {
      fields: ["jenisPerjalananId"],
      type: "foreign key",
      name: constraintName,
      references: {
        //Required field
        table: "jenisPerjalanans",
        field: "id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint(
      "sumberDanaJenisPerjalanans",
      constraintName
    );
  },
};
