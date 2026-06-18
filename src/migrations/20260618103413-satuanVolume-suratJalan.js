"use strict";

const constraintName = "fk-satuanVolume-suratJalan";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("suratJalans", {
      fields: ["satuanVolumeId"],
      type: "foreign key",
      name: constraintName,
      references: {
        //Required field
        table: "satuanVolumes",
        field: "id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("suratJalans", constraintName);
  },
};
