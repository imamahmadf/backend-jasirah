"use strict";

const constraintName = "fk-tunjangan-pegawaiTunjangan";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("pegawaiTunjangans", {
      fields: ["tunjanganId"],
      type: "foreign key",
      name: constraintName,
      references: {
        //Required field
        table: "tunjangans",
        field: "id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("pegawaiTunjangans", constraintName);
  },
};
