"use strict";

const constraintName = "fk-sumurMinyak-mitra";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("sumurMinyaks", {
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
    await queryInterface.removeConstraint("sumurMinyaks", constraintName);
  },
};
