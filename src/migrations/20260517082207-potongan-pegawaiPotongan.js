"use strict";

const constraintName = "fk-potongan-pegawaiPotongan";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("pegawaiPotongans", {
      fields: ["potonganId"],
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
    await queryInterface.removeConstraint("pegawaiPotongans", constraintName);
  },
};
