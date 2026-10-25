"use strict";

const tableName = "nomorUrutSuratJalanAsals";
const fkMitraName = "fk-mitra-nomorUrutSuratJalanAsal";
const fkAsalName = "fk-asalMinyak-nomorUrutSuratJalanAsal";

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
      mitraId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      asalMinyakId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      nomorUrut: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
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

    await queryInterface.addConstraint(tableName, {
      fields: ["asalMinyakId"],
      type: "foreign key",
      name: fkAsalName,
      references: {
        table: "asalMinyaks",
        field: "id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
    });

    await queryInterface.addIndex(tableName, ["mitraId", "asalMinyakId"], {
      unique: true,
      name: "uniq-nomor-urut-sj-mitra-asal",
    });

    await queryInterface.sequelize.query(`
      INSERT INTO ${tableName}
        (mitraId, asalMinyakId, nomorUrut, createdAt, updatedAt)
      SELECT
        sj.mitraId,
        sj.asalMinyakId,
        MAX(CAST(RIGHT(SUBSTRING_INDEX(sj.nomor, '/', 1), 3) AS UNSIGNED)),
        NOW(),
        NOW()
      FROM suratJalans sj
      WHERE sj.mitraId IS NOT NULL
        AND sj.asalMinyakId IS NOT NULL
        AND sj.nomor IS NOT NULL
        AND sj.nomor <> ''
        AND SUBSTRING_INDEX(sj.nomor, '/', 1) REGEXP '[0-9]{3}$'
      GROUP BY sj.mitraId, sj.asalMinyakId
    `);
  },

  async down(queryInterface) {
    await queryInterface.dropTable(tableName);
  },
};
