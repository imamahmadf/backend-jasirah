"use strict";

const constraintName = "fk-stokMasuk-laporanPersediaan";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("stokKeluars", {
      fields: ["laporanPersediaanId"],
      type: "foreign key",
      name: constraintName,
      references: {
        //Required field
        table: "laporanPersediaans",
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
