"use strict";

const constraintName = "fk-stokMasuk-satuanPersediaan";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("stokMasuks", {
      fields: ["satuanPersediaanId"],
      type: "foreign key",
      name: constraintName,
      references: {
        //Required field
        table: "satuanPersediaans",
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
