"use strict";

const constraintName = "fk-konfirmasiPenerimaan-pengisianTanki";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("pengisianTankis", {
      fields: ["konfirmasiPenerimaanId"],
      type: "foreign key",
      name: constraintName,
      references: {
        //Required field
        table: "konfirmasiPenerimaans",
        field: "id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("pengisianTankis", constraintName);
  },
};
