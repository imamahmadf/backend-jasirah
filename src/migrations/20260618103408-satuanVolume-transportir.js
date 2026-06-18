"use strict";

const constraintName = "fk-satuanVolume-transportir";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("transportirs", {
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
    await queryInterface.removeConstraint("transportirs", constraintName);
  },
};
