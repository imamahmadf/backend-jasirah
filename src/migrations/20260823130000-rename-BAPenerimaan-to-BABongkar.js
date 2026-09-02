"use strict";

const oldConstraintName = "fk-BAPenerimaan-pengisianTanki";
const newConstraintName = "fk-BABongkar-pengisianTanki";

const tableExists = async (queryInterface, tableName) => {
  const tables = await queryInterface.showAllTables();
  const normalized = tables.map((t) =>
    typeof t === "string" ? t : Object.values(t)[0],
  );
  return normalized.includes(tableName);
};

const columnExists = async (queryInterface, tableName, columnName) => {
  const description = await queryInterface.describeTable(tableName);
  return Object.prototype.hasOwnProperty.call(description, columnName);
};

const constraintExists = async (sequelize, tableName, constraintName) => {
  const [rows] = await sequelize.query(
    `
      SELECT CONSTRAINT_NAME
      FROM information_schema.TABLE_CONSTRAINTS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = :tableName
        AND CONSTRAINT_NAME = :constraintName
    `,
    { replacements: { tableName, constraintName } },
  );
  return rows.length > 0;
};

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const { sequelize } = queryInterface;

    const hasOldTable = await tableExists(queryInterface, "BAPenerimaans");
    const hasNewTable = await tableExists(queryInterface, "BABongkars");
    const hasOldColumn = await columnExists(
      queryInterface,
      "pengisianTankis",
      "BAPenerimaanId",
    );
    const hasNewColumn = await columnExists(
      queryInterface,
      "pengisianTankis",
      "BABongkarId",
    );

    if (await constraintExists(sequelize, "pengisianTankis", oldConstraintName)) {
      await queryInterface.removeConstraint("pengisianTankis", oldConstraintName);
    }

    if (hasOldColumn && !hasNewColumn) {
      await queryInterface.renameColumn(
        "pengisianTankis",
        "BAPenerimaanId",
        "BABongkarId",
      );
    }

    if (hasOldTable && !hasNewTable) {
      await queryInterface.renameTable("BAPenerimaans", "BABongkars");
    }

    if (
      !(await constraintExists(sequelize, "pengisianTankis", newConstraintName))
    ) {
      await queryInterface.addConstraint("pengisianTankis", {
        fields: ["BABongkarId"],
        type: "foreign key",
        name: newConstraintName,
        references: {
          table: "BABongkars",
          field: "id",
        },
        onDelete: "cascade",
        onUpdate: "cascade",
      });
    }

    if (await tableExists(queryInterface, "templateKPBPNs")) {
      await sequelize.query(`
        ALTER TABLE templateKPBPNs
        MODIFY jenisDokumen ENUM('BAST', 'BAPenerimaan', 'BABongkar', 'suratJalan') NOT NULL
      `);

      await sequelize.query(`
        UPDATE templateKPBPNs
        SET jenisDokumen = 'BABongkar'
        WHERE jenisDokumen = 'BAPenerimaan'
      `);

      await sequelize.query(`
        UPDATE templateKPBPNs
        SET template = REPLACE(template, 'BAPenerimaan-template', 'BABongkar-template')
        WHERE template LIKE '%BAPenerimaan-template%'
      `);

      await sequelize.query(`
        ALTER TABLE templateKPBPNs
        MODIFY jenisDokumen ENUM('BAST', 'BABongkar', 'suratJalan') NOT NULL
      `);
    }
  },

  async down(queryInterface, Sequelize) {
    const { sequelize } = queryInterface;

    if (await tableExists(queryInterface, "templateKPBPNs")) {
      await sequelize.query(`
        ALTER TABLE templateKPBPNs
        MODIFY jenisDokumen ENUM('BAST', 'BAPenerimaan', 'BABongkar', 'suratJalan') NOT NULL
      `);

      await sequelize.query(`
        UPDATE templateKPBPNs
        SET jenisDokumen = 'BAPenerimaan'
        WHERE jenisDokumen = 'BABongkar'
      `);

      await sequelize.query(`
        UPDATE templateKPBPNs
        SET template = REPLACE(template, 'BABongkar-template', 'BAPenerimaan-template')
        WHERE template LIKE '%BABongkar-template%'
      `);

      await sequelize.query(`
        ALTER TABLE templateKPBPNs
        MODIFY jenisDokumen ENUM('BAST', 'BAPenerimaan', 'suratJalan') NOT NULL
      `);
    }

    if (await constraintExists(sequelize, "pengisianTankis", newConstraintName)) {
      await queryInterface.removeConstraint("pengisianTankis", newConstraintName);
    }

    const hasOldTable = await tableExists(queryInterface, "BAPenerimaans");
    const hasNewTable = await tableExists(queryInterface, "BABongkars");
    const hasOldColumn = await columnExists(
      queryInterface,
      "pengisianTankis",
      "BAPenerimaanId",
    );
    const hasNewColumn = await columnExists(
      queryInterface,
      "pengisianTankis",
      "BABongkarId",
    );

    if (hasNewTable && !hasOldTable) {
      await queryInterface.renameTable("BABongkars", "BAPenerimaans");
    }

    if (hasNewColumn && !hasOldColumn) {
      await queryInterface.renameColumn(
        "pengisianTankis",
        "BABongkarId",
        "BAPenerimaanId",
      );
    }

    if (
      !(await constraintExists(sequelize, "pengisianTankis", oldConstraintName))
    ) {
      await queryInterface.addConstraint("pengisianTankis", {
        fields: ["BAPenerimaanId"],
        type: "foreign key",
        name: oldConstraintName,
        references: {
          table: "BAPenerimaans",
          field: "id",
        },
        onDelete: "cascade",
        onUpdate: "cascade",
      });
    }
  },
};
