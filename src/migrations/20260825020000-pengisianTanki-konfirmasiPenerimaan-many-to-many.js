"use strict";

const constraintName = "fk-konfirmasiPenerimaan-pengisianTanki";
const throughTable = "pengisianTankiKonfirmasis";
const uniqueName = "unique_pengisianTanki_konfirmasiPenerimaan";
const fkPengisianName = "fk-pengisianTankiKonfirmasi-pengisianTanki";
const fkKonfirmasiName = "fk-pengisianTankiKonfirmasi-konfirmasiPenerimaan";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(throughTable, {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      pengisianTankiId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      konfirmasiPenerimaanId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    await queryInterface.addConstraint(throughTable, {
      fields: ["pengisianTankiId"],
      type: "foreign key",
      name: fkPengisianName,
      references: {
        table: "pengisianTankis",
        field: "id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
    });

    await queryInterface.addConstraint(throughTable, {
      fields: ["konfirmasiPenerimaanId"],
      type: "foreign key",
      name: fkKonfirmasiName,
      references: {
        table: "konfirmasiPenerimaans",
        field: "id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
    });

    await queryInterface.addConstraint(throughTable, {
      fields: ["pengisianTankiId", "konfirmasiPenerimaanId"],
      type: "unique",
      name: uniqueName,
    });

    const [existingLinks] = await queryInterface.sequelize.query(
      `SELECT id, pengisianTankiId, createdAt, updatedAt
       FROM konfirmasiPenerimaans
       WHERE pengisianTankiId IS NOT NULL`,
    );

    if (existingLinks.length) {
      await queryInterface.bulkInsert(
        throughTable,
        existingLinks.map((row) => ({
          pengisianTankiId: row.pengisianTankiId,
          konfirmasiPenerimaanId: row.id,
          createdAt: row.createdAt || new Date(),
          updatedAt: row.updatedAt || new Date(),
        })),
      );
    }

    await queryInterface.removeConstraint("konfirmasiPenerimaans", constraintName);
    await queryInterface.removeColumn("konfirmasiPenerimaans", "pengisianTankiId");
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn("konfirmasiPenerimaans", "pengisianTankiId", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    const [existingLinks] = await queryInterface.sequelize.query(
      `SELECT konfirmasiPenerimaanId, MIN(pengisianTankiId) AS pengisianTankiId
       FROM ${throughTable}
       GROUP BY konfirmasiPenerimaanId`,
    );

    for (const row of existingLinks) {
      await queryInterface.sequelize.query(
        `UPDATE konfirmasiPenerimaans
         SET pengisianTankiId = :pengisianTankiId
         WHERE id = :id`,
        {
          replacements: {
            pengisianTankiId: row.pengisianTankiId,
            id: row.konfirmasiPenerimaanId,
          },
        },
      );
    }

    await queryInterface.addConstraint("konfirmasiPenerimaans", {
      fields: ["pengisianTankiId"],
      type: "foreign key",
      name: constraintName,
      references: {
        table: "pengisianTankis",
        field: "id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
    });

    await queryInterface.dropTable(throughTable);
  },
};
