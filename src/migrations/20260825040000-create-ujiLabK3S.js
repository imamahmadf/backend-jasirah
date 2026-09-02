"use strict";

const tableName = "ujiLabK3S";
const fkTankiName = "fk-ujiLabK3S-tanki";
const fkBaName = "fk-ujiLabK3S-BABongkar";

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
      tangkiId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      tanggal: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      foto: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      api: {
        type: Sequelize.DECIMAL(10, 3),
        allowNull: true,
      },
      BSNW: {
        type: Sequelize.DECIMAL(10, 3),
        allowNull: true,
      },
      suhu: {
        type: Sequelize.DECIMAL(10, 3),
        allowNull: true,
      },
      sg: {
        type: Sequelize.DECIMAL(10, 3),
        allowNull: true,
      },
      kualitas: {
        type: Sequelize.ENUM("OFFSPEC", "ONSPEC"),
        allowNull: false,
      },
      BABongkarId: {
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
      fields: ["BABongkarId"],
      type: "foreign key",
      name: fkBaName,
      references: {
        table: "BABongkars",
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
