"use strict";

const tableName = "BAK3S";
const fkBaName = "fk-BAK3S-BABongkar";
const uniqueBaName = "uniq-BAK3S-BABongkarId";

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
      dokumen: {
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
      produksi: {
        type: Sequelize.DECIMAL(10, 3),
        allowNull: true,
      },
      sg: {
        type: Sequelize.DECIMAL(10, 3),
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
      fields: ["BABongkarId"],
      type: "unique",
      name: uniqueBaName,
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable(tableName);
  },
};
