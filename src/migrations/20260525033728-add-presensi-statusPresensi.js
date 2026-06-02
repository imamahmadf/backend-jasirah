"use strict";

const constraintName = "fk-presensi-statusPresensi";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("presensis", {
      fields: ["statusPresensiId"],
      type: "foreign key",
      name: constraintName,
      references: {
        //Required field
        table: "statusPresensis",
        field: "id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("presensis", constraintName);
  },
};
