"use strict";

const tableName = "riwayatMitraSumurs";
const fkSumurName = "fk-sumurMinyak-riwayatMitraSumur";
const fkMitraName = "fk-mitra-riwayatMitraSumur";

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
      sumurMinyakId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      mitraId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      mulai: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      selesai: {
        type: Sequelize.DATE,
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
      fields: ["sumurMinyakId"],
      type: "foreign key",
      name: fkSumurName,
      references: {
        table: "sumurMinyaks",
        field: "id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
    });

    await queryInterface.addConstraint(tableName, {
      fields: ["mitraId"],
      type: "foreign key",
      name: fkMitraName,
      references: {
        table: "mitras",
        field: "id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
    });

    await queryInterface.addIndex(tableName, ["sumurMinyakId", "mulai"], {
      name: "idx-riwayatMitra-sumur-mulai",
    });
    await queryInterface.addIndex(tableName, ["mitraId", "mulai"], {
      name: "idx-riwayatMitra-mitra-mulai",
    });

    await queryInterface.sequelize.query(`
      INSERT INTO ${tableName}
        (sumurMinyakId, mitraId, mulai, selesai, createdAt, updatedAt)
      SELECT id, mitraId, '1970-01-01 00:00:00', NULL, NOW(), NOW()
      FROM sumurMinyaks
      WHERE mitraId IS NOT NULL
    `);
  },

  async down(queryInterface) {
    await queryInterface.dropTable(tableName);
  },
};
