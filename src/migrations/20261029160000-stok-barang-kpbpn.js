"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const barang = await queryInterface.describeTable("barangJasaKpbpns");
    if (!barang.stok) {
      await queryInterface.addColumn("barangJasaKpbpns", "stok", {
        type: Sequelize.DECIMAL(12, 3),
        allowNull: false,
        defaultValue: 0,
      });
    }

    const tables = await queryInterface.showAllTables();
    const adaTabel = tables
      .map((name) => (typeof name === "string" ? name : name.tableName || name))
      .includes("mutasiStokBarangKpbpns");
    if (adaTabel) return;

    await queryInterface.createTable("mutasiStokBarangKpbpns", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      jenis: {
        type: Sequelize.ENUM("masuk", "keluar"),
        allowNull: false,
      },
      jumlah: {
        type: Sequelize.DECIMAL(12, 3),
        allowNull: false,
      },
      keterangan: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      barangJasaKpbpnId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "barangJasaKpbpns",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      pengajuanBarjasKpbpnId: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      itemPengajuanBarjasKpbpnId: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      userKPBPNId: {
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

    await queryInterface.addIndex("mutasiStokBarangKpbpns", ["barangJasaKpbpnId"]);
    await queryInterface.addIndex("mutasiStokBarangKpbpns", ["pengajuanBarjasKpbpnId"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("mutasiStokBarangKpbpns");
    const barang = await queryInterface.describeTable("barangJasaKpbpns");
    if (barang.stok) {
      await queryInterface.removeColumn("barangJasaKpbpns", "stok");
    }
  },
};
