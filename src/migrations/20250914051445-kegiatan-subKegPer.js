"use strict";

const constraintName = "fk-kegiatan-subKegPer";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("subKegPers", {
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
    await queryInterface.removeConstraint("subKegPers", constraintName);
  },
};
