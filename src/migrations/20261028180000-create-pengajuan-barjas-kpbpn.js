"use strict";

const tableExists = async (queryInterface, name) => {
  try {
    await queryInterface.describeTable(name);
    return true;
  } catch (err) {
    return false;
  }
};

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    if (!(await tableExists(queryInterface, "statusPengajuanKpbpns"))) {
      await queryInterface.createTable("statusPengajuanKpbpns", {
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
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
      });

      const now = new Date();
      await queryInterface.bulkInsert("statusPengajuanKpbpns", [
        { id: 1, nama: "Diajukan", createdAt: now, updatedAt: now },
        { id: 2, nama: "Disetujui", createdAt: now, updatedAt: now },
        { id: 3, nama: "Ditolak", createdAt: now, updatedAt: now },
        { id: 4, nama: "Diproses", createdAt: now, updatedAt: now },
        { id: 5, nama: "Selesai", createdAt: now, updatedAt: now },
      ]);
    }

    if (!(await tableExists(queryInterface, "pengajuanBarjasKpbpns"))) {
      await queryInterface.createTable("pengajuanBarjasKpbpns", {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        nomor: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true,
        },
        tanggal: {
          type: Sequelize.DATEONLY,
          allowNull: false,
        },
        level: {
          type: Sequelize.ENUM("normal", "urgent"),
          allowNull: false,
          defaultValue: "normal",
        },
        jenis: {
          type: Sequelize.ENUM("barang", "jasa"),
          allowNull: false,
        },
        keperluan: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        catatan: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        tanggalDibutuhkan: {
          type: Sequelize.DATEONLY,
          allowNull: true,
        },
        lokasi: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        alasanPenolakan: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        statusPengajuanKpbpnId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: "statusPengajuanKpbpns",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "RESTRICT",
        },
        pemohonId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: "userKPBPNs",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "RESTRICT",
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

    if (!(await tableExists(queryInterface, "itemPengajuanBarjasKpbpns"))) {
      await queryInterface.createTable("itemPengajuanBarjasKpbpns", {
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
        spesifikasi: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        jumlah: {
          type: Sequelize.DECIMAL(12, 3),
          allowNull: false,
        },
        satuan: {
          type: Sequelize.STRING,
          allowNull: false,
          defaultValue: "unit",
        },
        keterangan: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        foto: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        estimasiHarga: {
          type: Sequelize.BIGINT,
          allowNull: false,
          defaultValue: 0,
        },
        hargaAktual: {
          type: Sequelize.BIGINT,
          allowNull: true,
        },
        pengajuanBarjasKpbpnId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: "pengajuanBarjasKpbpns",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
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
  },

  async down(queryInterface) {
    await queryInterface.dropTable("itemPengajuanBarjasKpbpns");
    await queryInterface.dropTable("pengajuanBarjasKpbpns");
    await queryInterface.dropTable("statusPengajuanKpbpns");
  },
};
