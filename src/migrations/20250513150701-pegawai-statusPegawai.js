"use strict";

const constraintName = "fk-statusPegawai-pegawai";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("pegawais", {
      fields: ["statusPegawaiId"],
      type: "foreign key",
      name: constraintName,
      references: {
        //Required field
        table: "statusPegawais",
        field: "id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("pegawais", constraintName);
  },
};
