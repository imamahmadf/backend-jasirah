"use strict";

const constraintName = "fk-pengisianTanki-userKPBPN";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("pengisianTankis");
    if (!table.userKPBPNId) {
      await queryInterface.addColumn("pengisianTankis", "userKPBPNId", {
        type: Sequelize.INTEGER,
        allowNull: true,
      });
    }

    const [constraints] = await queryInterface.sequelize.query(
      `SELECT CONSTRAINT_NAME
       FROM information_schema.TABLE_CONSTRAINTS
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME = 'pengisianTankis'
         AND CONSTRAINT_NAME = :constraintName`,
      { replacements: { constraintName } },
    );

    if (!constraints.length) {
      await queryInterface.addConstraint("pengisianTankis", {
        fields: ["userKPBPNId"],
        type: "foreign key",
        name: constraintName,
        references: {
          table: "userKPBPNs",
          field: "id",
        },
        onDelete: "set null",
        onUpdate: "cascade",
      });
    }
  },

  async down(queryInterface) {
    const [constraints] = await queryInterface.sequelize.query(
      `SELECT CONSTRAINT_NAME
       FROM information_schema.TABLE_CONSTRAINTS
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME = 'pengisianTankis'
         AND CONSTRAINT_NAME = :constraintName`,
      { replacements: { constraintName } },
    );

    if (constraints.length) {
      await queryInterface.removeConstraint("pengisianTankis", constraintName);
    }

    const table = await queryInterface.describeTable("pengisianTankis");
    if (table.userKPBPNId) {
      await queryInterface.removeColumn("pengisianTankis", "userKPBPNId");
    }
  },
};
