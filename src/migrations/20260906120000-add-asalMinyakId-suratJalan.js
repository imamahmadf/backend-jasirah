"use strict";

const constraintName = "fk-asalMinyak-suratJalan";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("suratJalans", "asalMinyakId", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.addConstraint("suratJalans", {
      fields: ["asalMinyakId"],
      type: "foreign key",
      name: constraintName,
      references: {
        table: "asalMinyaks",
        field: "id",
      },
      onDelete: "set null",
      onUpdate: "cascade",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeConstraint("suratJalans", constraintName);
    await queryInterface.removeColumn("suratJalans", "asalMinyakId");
  },
};
