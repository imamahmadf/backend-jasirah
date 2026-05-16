"use strict";

const constraintName = "fk-stokMasuk-persediaan";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("stokMasuks", {
      fields: ["persediaanId"],
      type: "foreign key",
      name: constraintName,
      references: {
        //Required field
        table: "persediaans",
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
