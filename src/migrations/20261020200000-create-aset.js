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
    if (!(await tableExists(queryInterface, "jenisAsets"))) {
      await queryInterface.createTable("jenisAsets", {
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
      await queryInterface.bulkInsert("jenisAsets", [
        { nama: "Tanah", createdAt: now, updatedAt: now },
        { nama: "Bangunan", createdAt: now, updatedAt: now },
        { nama: "Kendaraan", createdAt: now, updatedAt: now },
        { nama: "Peralatan", createdAt: now, updatedAt: now },
        { nama: "Inventaris", createdAt: now, updatedAt: now },
        { nama: "Elektronik", createdAt: now, updatedAt: now },
      ]);
    }

    if (!(await tableExists(queryInterface, "kondisiAsets"))) {
      await queryInterface.createTable("kondisiAsets", {
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
      await queryInterface.bulkInsert("kondisiAsets", [
        { nama: "Baik", createdAt: now, updatedAt: now },
        { nama: "Rusak Ringan", createdAt: now, updatedAt: now },
        { nama: "Rusak Berat", createdAt: now, updatedAt: now },
      ]);
    }

    if (!(await tableExists(queryInterface, "asets"))) {
      await queryInterface.createTable("asets", {
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
        kode: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true,
        },
        pengeluaranId: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        harga: {
          type: Sequelize.INTEGER,
          allowNull: true,
          defaultValue: 0,
        },
        jenisAsetId: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        tanggal: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        foto: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        kondisiAsetId: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        merek: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        spesifikasi: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        penanggungjawabId: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        unitKerjaId: {
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

      await queryInterface.addConstraint("asets", {
        fields: ["pengeluaranId"],
        type: "foreign key",
        name: "fk-aset-pengeluaran",
        references: { table: "pengeluarans", field: "id" },
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      });
      await queryInterface.addConstraint("asets", {
        fields: ["jenisAsetId"],
        type: "foreign key",
        name: "fk-aset-jenisAset",
        references: { table: "jenisAsets", field: "id" },
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      });
      await queryInterface.addConstraint("asets", {
        fields: ["kondisiAsetId"],
        type: "foreign key",
        name: "fk-aset-kondisiAset",
        references: { table: "kondisiAsets", field: "id" },
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      });
      await queryInterface.addConstraint("asets", {
        fields: ["penanggungjawabId"],
        type: "foreign key",
        name: "fk-aset-pegawai",
        references: { table: "pegawais", field: "id" },
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      });
      await queryInterface.addConstraint("asets", {
        fields: ["unitKerjaId"],
        type: "foreign key",
        name: "fk-aset-unitKerja",
        references: { table: "daftarUnitKerjas", field: "id" },
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      });
    }
  },

  async down(queryInterface) {
    if (await tableExists(queryInterface, "asets")) {
      await queryInterface.dropTable("asets");
    }
    if (await tableExists(queryInterface, "jenisAsets")) {
      await queryInterface.dropTable("jenisAsets");
    }
    if (await tableExists(queryInterface, "kondisiAsets")) {
      await queryInterface.dropTable("kondisiAsets");
    }
  },
};
