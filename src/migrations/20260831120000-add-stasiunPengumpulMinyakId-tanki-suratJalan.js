"use strict";

const tankiConstraint = "fk-stasiunPengumpulMinyak-tanki";
const suratJalanConstraint = "fk-stasiunPengumpulMinyak-suratJalan";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();
    const tableNames = tables.map((table) =>
      typeof table === "string" ? table : Object.values(table)[0],
    );

    if (
      tableNames.includes("stasuinPengumpulMinyaks") &&
      !tableNames.includes("stasiunPengumpulMinyaks")
    ) {
      await queryInterface.renameTable(
        "stasuinPengumpulMinyaks",
        "stasiunPengumpulMinyaks",
      );
    }

    await queryInterface.addColumn("tankis", "stasiunPengumpulMinyakId", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.addConstraint("tankis", {
      fields: ["stasiunPengumpulMinyakId"],
      type: "foreign key",
      name: tankiConstraint,
      references: {
        table: "stasiunPengumpulMinyaks",
        field: "id",
      },
      onDelete: "set null",
      onUpdate: "cascade",
    });

    await queryInterface.addColumn("suratJalans", "stasiunPengumpulMinyakId", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.addConstraint("suratJalans", {
      fields: ["stasiunPengumpulMinyakId"],
      type: "foreign key",
      name: suratJalanConstraint,
      references: {
        table: "stasiunPengumpulMinyaks",
        field: "id",
      },
      onDelete: "set null",
      onUpdate: "cascade",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeConstraint("suratJalans", suratJalanConstraint);
    await queryInterface.removeColumn("suratJalans", "stasiunPengumpulMinyakId");
    await queryInterface.removeConstraint("tankis", tankiConstraint);
    await queryInterface.removeColumn("tankis", "stasiunPengumpulMinyakId");
  },
};
