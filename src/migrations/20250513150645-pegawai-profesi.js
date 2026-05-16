"use strict";

const constraintName = "fk-profesi-pegawai";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("pegawais", {
      fields: ["profesiId"],
      type: "foreign key",
      name: constraintName,
      references: {
        //Required field
        table: "profesis",
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
