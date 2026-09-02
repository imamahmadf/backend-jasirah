"use strict";

const tableName = "BABongkarTankis";
const fkBaName = "fk-BABongkarTanki-BABongkar";
const fkTankiName = "fk-BABongkarTanki-tanki";
const uniqueName = "unique_BABongkar_tangki";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(tableName, {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      BABongkarId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      tangkiId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      ukuranCairan: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      ukuranAir: {
        type: Sequelize.INTEGER,
        allowNull: true,
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

    await queryInterface.addConstraint(tableName, {
      fields: ["BABongkarId"],
      type: "foreign key",
      name: fkBaName,
      references: {
        table: "BABongkars",
        field: "id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
    });

    await queryInterface.addConstraint(tableName, {
      fields: ["tangkiId"],
      type: "foreign key",
      name: fkTankiName,
      references: {
        table: "tankis",
        field: "id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
    });

    await queryInterface.addConstraint(tableName, {
      fields: ["BABongkarId", "tangkiId"],
      type: "unique",
      name: uniqueName,
    });

    const [existing] = await queryInterface.sequelize.query(
      `SELECT DISTINCT
         p.BABongkarId,
         p.tangkiId,
         b.ukuranCairan,
         b.ukuranAir,
         b.createdAt,
         b.updatedAt
       FROM pengisianTankis p
       INNER JOIN BABongkars b ON b.id = p.BABongkarId
       WHERE p.BABongkarId IS NOT NULL
         AND p.tangkiId IS NOT NULL`,
    );

    if (existing.length) {
      await queryInterface.bulkInsert(
        tableName,
        existing.map((row) => ({
          BABongkarId: row.BABongkarId,
          tangkiId: row.tangkiId,
          ukuranCairan: row.ukuranCairan,
          ukuranAir: row.ukuranAir,
          createdAt: row.createdAt || new Date(),
          updatedAt: row.updatedAt || new Date(),
        })),
      );
    }
  },

  async down(queryInterface) {
    await queryInterface.dropTable(tableName);
  },
};
