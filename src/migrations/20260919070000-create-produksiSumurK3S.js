"use strict";

const tableName = "produksiSumurK3S";
const fkSumurName = "fk-sumurMinyak-produksiSumurK3S";
const fkBak3sName = "fk-BAK3S-produksiSumurK3S";
const fkSatuanName = "fk-satuanVolume-produksiSumurK3S";

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
      produksi: {
        type: Sequelize.INTEGER,
      },
      sumurMinyakId: {
        type: Sequelize.INTEGER,
      },
      BAK3SId: {
        type: Sequelize.INTEGER,
      },
      satuanVolumeId: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      tanggal: {
        type: Sequelize.DATE,
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
      fields: ["BAK3SId"],
      type: "foreign key",
      name: fkBak3sName,
      references: {
        table: "BAK3S",
        field: "id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
    });

    await queryInterface.addConstraint(tableName, {
      fields: ["satuanVolumeId"],
      type: "foreign key",
      name: fkSatuanName,
      references: {
        table: "satuanVolumes",
        field: "id",
      },
      onDelete: "set null",
      onUpdate: "cascade",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable(tableName);
  },
};
