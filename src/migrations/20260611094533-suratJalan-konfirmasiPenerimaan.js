"use strict";

const constraintName = "fk-suratJalan-konfirmasiPenerimaan";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("konfirmasiPenerimaans", {
      fields: ["suratJalanId"],
      type: "foreign key",
      name: constraintName,
      references: {
        //Required field
        table: "suratJalans",
        field: "id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint(
      "konfirmasiPenerimaans",
      constraintName,
    );
  },
};
