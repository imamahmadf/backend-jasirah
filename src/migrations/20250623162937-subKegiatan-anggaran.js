"use strict";

const constraintName = "fk-subKegiatan-anggaran";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("anggarans", {
      fields: ["subKegiatanId"],
      type: "foreign key",
      name: constraintName,
      references: {
        //Required field
        table: "daftarSubKegiatans",
        field: "id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("anggarans", constraintName);
  },
};
