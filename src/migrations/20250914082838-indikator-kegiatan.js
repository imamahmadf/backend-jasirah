"use strict";

const constraintName = "fk-idnikator-kegiatan";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("indikators", {
      fields: ["kegiatanId"],
      type: "foreign key",
      name: constraintName,
      references: {
        //Required field
        table: "kegiatans",
        field: "id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("indikators", constraintName);
  },
};
