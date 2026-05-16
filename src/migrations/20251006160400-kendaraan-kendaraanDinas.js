"use strict";

const constraintName = "fk-kendaraan-kendaraanDinas";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("kendaraanDinas", {
      fields: ["kendaraanId"],
      type: "foreign key",
      name: constraintName,
      references: {
        //Required field
        table: "kendaraans",
        field: "id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("kendaraanDinas", constraintName);
  },
};
