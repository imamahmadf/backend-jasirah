"use strict";

const constraintName = "fk-stokKeluar-laporanPersediaan";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("stokMasuks", {
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
    await queryInterface.removeConstraint("stokMasuks", constraintName);
  },
};
