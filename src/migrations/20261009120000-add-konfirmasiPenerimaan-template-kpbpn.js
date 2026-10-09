"use strict";

const tableExists = async (queryInterface, tableName) => {
  const tables = await queryInterface.showAllTables();
  const normalized = tables.map((t) =>
    String(typeof t === "string" ? t : Object.values(t)[0]).toLowerCase(),
  );
  return normalized.includes(String(tableName).toLowerCase());
};

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const { sequelize } = queryInterface;

    if (await tableExists(queryInterface, "templateKPBPNs")) {
      await sequelize.query(`
        ALTER TABLE templateKPBPNs
        MODIFY jenisDokumen ENUM('BAST', 'BAPenerimaan', 'BABongkar', 'suratJalan', 'konfirmasiPenerimaan') NOT NULL
      `);

      await sequelize.query(`
        UPDATE templateKPBPNs
        SET jenisDokumen = 'BABongkar'
        WHERE jenisDokumen = 'BAPenerimaan'
      `);

      await sequelize.query(`
        ALTER TABLE templateKPBPNs
        MODIFY jenisDokumen ENUM('BAST', 'BABongkar', 'suratJalan', 'konfirmasiPenerimaan') NOT NULL
      `);
    }
  },

  async down(queryInterface) {
    const { sequelize } = queryInterface;

    if (await tableExists(queryInterface, "templateKPBPNs")) {
      await sequelize.query(`
        DELETE FROM templateKPBPNs
        WHERE jenisDokumen = 'konfirmasiPenerimaan'
      `);

      await sequelize.query(`
        ALTER TABLE templateKPBPNs
        MODIFY jenisDokumen ENUM('BAST', 'BABongkar', 'suratJalan') NOT NULL
      `);
    }
  },
};
