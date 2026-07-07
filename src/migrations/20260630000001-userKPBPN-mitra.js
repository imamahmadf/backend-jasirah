"use strict";

const constraintName = "fk-userKPBPN-mitra";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("userKPBPNs", {
      fields: ["mitraId"],
      type: "foreign key",
      name: constraintName,
      references: {
        table: "mitras",
        field: "id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("userKPBPNs", constraintName);
  },
};
