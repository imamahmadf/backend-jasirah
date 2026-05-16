"use strict";

const constraintName = "fk-tahunAnggaran-jenisAnggaran";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("tahunAnggarans", {
      fields: ["jenisAnggaranId"],
      type: "foreign key",
      name: constraintName,
      references: {
        //Required field
        table: "jenisAnggarans",
        field: "id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("tahunAnggarans", constraintName);
  },
};
