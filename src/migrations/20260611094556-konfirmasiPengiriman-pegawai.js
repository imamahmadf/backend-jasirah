"use strict";

const constraintName = "fk-pegawai-konfirmasiPenerimaan";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("konfirmasiPenerimaans", {
      fields: ["pegawaiId"],
      type: "foreign key",
      name: constraintName,
      references: {
        //Required field
        table: "pegawais",
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
