"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();
    const adaTabel = tables
      .map((name) => (typeof name === "string" ? name : name.tableName || name))
      .includes("barangJasaKpbpns");

    if (!adaTabel) {
      await queryInterface.createTable("barangJasaKpbpns", {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        nama: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        jenis: {
          type: Sequelize.ENUM("barang", "jasa"),
          allowNull: false,
        },
        satuan: {
          type: Sequelize.STRING,
          allowNull: false,
          defaultValue: "unit",
        },
        spesifikasi: {
          type: Sequelize.TEXT,
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
    }

    const item = await queryInterface.describeTable("itemPengajuanBarjasKpbpns");
    if (!item.barangJasaKpbpnId) {
      await queryInterface.addColumn("itemPengajuanBarjasKpbpns", "barangJasaKpbpnId", {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "barangJasaKpbpns",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      });
    }
  },

  async down(queryInterface) {
    const item = await queryInterface.describeTable("itemPengajuanBarjasKpbpns");
    if (item.barangJasaKpbpnId) {
      await queryInterface.removeColumn(
        "itemPengajuanBarjasKpbpns",
        "barangJasaKpbpnId",
      );
    }
    await queryInterface.dropTable("barangJasaKpbpns");
  },
};
