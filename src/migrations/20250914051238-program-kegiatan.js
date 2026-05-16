"use strict";

const constraintName = "fk-program-kegiatan";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("kegiatans", {
      fields: ["programId"],
      type: "foreign key",
      name: constraintName,
      references: {
        //Required field
        table: "programs",
        field: "id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("kegiatans", constraintName);
  },
};
