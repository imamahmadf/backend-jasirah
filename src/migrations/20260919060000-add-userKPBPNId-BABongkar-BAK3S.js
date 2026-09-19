"use strict";

const tables = [
  {
    name: "BABongkars",
    constraint: "fk-BABongkar-userKPBPN",
  },
  {
    name: "BAK3S",
    constraint: "fk-BAK3S-userKPBPN",
  },
];

const constraintExists = async (queryInterface, tableName, constraintName) => {
  const [rows] = await queryInterface.sequelize.query(
    `SELECT CONSTRAINT_NAME
     FROM information_schema.TABLE_CONSTRAINTS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = :tableName
       AND CONSTRAINT_NAME = :constraintName`,
    { replacements: { tableName, constraintName } },
  );
  return rows.length > 0;
};

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    for (const table of tables) {
      const columns = await queryInterface.describeTable(table.name);
      if (!columns.userKPBPNId) {
        await queryInterface.addColumn(table.name, "userKPBPNId", {
          type: Sequelize.INTEGER,
          allowNull: true,
        });
      }

      if (!(await constraintExists(queryInterface, table.name, table.constraint))) {
        await queryInterface.addConstraint(table.name, {
          fields: ["userKPBPNId"],
          type: "foreign key",
          name: table.constraint,
          references: {
            table: "userKPBPNs",
            field: "id",
          },
          onDelete: "set null",
          onUpdate: "cascade",
        });
      }
    }
  },

  async down(queryInterface) {
    for (const table of [...tables].reverse()) {
      if (await constraintExists(queryInterface, table.name, table.constraint)) {
        await queryInterface.removeConstraint(table.name, table.constraint);
      }

      const columns = await queryInterface.describeTable(table.name);
      if (columns.userKPBPNId) {
        await queryInterface.removeColumn(table.name, "userKPBPNId");
      }
    }
  },
};
