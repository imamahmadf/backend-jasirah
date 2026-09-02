"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("produksiSumurs", "suratJalanId", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.addConstraint("produksiSumurs", {
      fields: ["suratJalanId"],
      type: "foreign key",
      name: "fk-suratJalan-produksiSumur",
      references: {
        table: "suratJalans",
        field: "id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeConstraint(
      "produksiSumurs",
      "fk-suratJalan-produksiSumur",
    );
    await queryInterface.removeColumn("produksiSumurs", "suratJalanId");
  },
};
