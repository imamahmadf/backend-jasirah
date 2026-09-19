"use strict";

const tableName = "konfirmasiPenerimaans";
const columns = [
  {
    name: "userPKId",
    constraint: "fk-konfirmasiPenerimaan-userPK",
  },
  {
    name: "userLabId",
    constraint: "fk-konfirmasiPenerimaan-userLab",
  },
];

const constraintExists = async (queryInterface, constraintName) => {
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
    const table = await queryInterface.describeTable(tableName);

    for (const column of columns) {
      if (!table[column.name]) {
        await queryInterface.addColumn(tableName, column.name, {
          type: Sequelize.INTEGER,
          allowNull: true,
        });
      }

      if (!(await constraintExists(queryInterface, column.constraint))) {
        await queryInterface.addConstraint(tableName, {
          fields: [column.name],
          type: "foreign key",
          name: column.constraint,
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
    const table = await queryInterface.describeTable(tableName);

    for (const column of [...columns].reverse()) {
      if (await constraintExists(queryInterface, column.constraint)) {
        await queryInterface.removeConstraint(tableName, column.constraint);
      }

      if (table[column.name]) {
        await queryInterface.removeColumn(tableName, column.name);
      }
    }
  },
};
