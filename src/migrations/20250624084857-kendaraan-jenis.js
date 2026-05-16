"use strict";

const constraintName = "fk-kendaraan-jenis";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("kendaraans", {
      fields: ["jenisKendaraanId"],
      type: "foreign key",
      name: constraintName,
      references: {
        //Required field
        table: "jenisKendaraans",
        field: "id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("kendaraans", constraintName);
  },
};
