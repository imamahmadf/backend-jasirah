"use strict";

const constraintName = "fk-stokKeluar-stokMasuk";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("stokKeluars", {
      fields: ["stokMasukId"],
      type: "foreign key",
      name: constraintName,
      references: {
        //Required field
        table: "stokMasuks",
        field: "id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("stokKeluars", constraintName);
  },
};
