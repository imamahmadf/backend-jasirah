"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("supirs");
    if (!table.mitraId) return;

    try {
      await queryInterface.removeConstraint("supirs", "fk-supir-mitra");
    } catch (err) {
      const [constraints] = await queryInterface.sequelize.query(
        `
        SELECT CONSTRAINT_NAME AS name
        FROM information_schema.KEY_COLUMN_USAGE
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'supirs'
          AND COLUMN_NAME = 'mitraId'
          AND REFERENCED_TABLE_NAME IS NOT NULL
        `,
      );
      for (const constraint of constraints) {
        await queryInterface.removeConstraint("supirs", constraint.name);
      }
    }

    await queryInterface.removeColumn("supirs", "mitraId");
  },

  async down(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("supirs");
    if (table.mitraId) return;

    await queryInterface.addColumn("supirs", "mitraId", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.addConstraint("supirs", {
      fields: ["mitraId"],
      type: "foreign key",
      name: "fk-supir-mitra",
      references: {
        table: "mitras",
        field: "id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
    });
  },
};
