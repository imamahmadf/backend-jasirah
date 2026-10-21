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
    if (await tableExists(queryInterface, "mutasiAsets")) return;

    await queryInterface.createTable("mutasiAsets", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      asetId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      unitKerjaAsalId: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      unitKerjaTujuanId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      penanggungjawabAsalId: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      penanggungjawabTujuanId: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      tanggal: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      keterangan: {
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

    await queryInterface.addConstraint("mutasiAsets", {
      fields: ["asetId"],
      type: "foreign key",
      name: "fk-mutasiAset-aset",
      references: { table: "asets", field: "id" },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
    await queryInterface.addConstraint("mutasiAsets", {
      fields: ["unitKerjaAsalId"],
      type: "foreign key",
      name: "fk-mutasiAset-unitAsal",
      references: { table: "daftarUnitKerjas", field: "id" },
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    });
    await queryInterface.addConstraint("mutasiAsets", {
      fields: ["unitKerjaTujuanId"],
      type: "foreign key",
      name: "fk-mutasiAset-unitTujuan",
      references: { table: "daftarUnitKerjas", field: "id" },
      onDelete: "RESTRICT",
      onUpdate: "CASCADE",
    });
    await queryInterface.addConstraint("mutasiAsets", {
      fields: ["penanggungjawabAsalId"],
      type: "foreign key",
      name: "fk-mutasiAset-pjAsal",
      references: { table: "pegawais", field: "id" },
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    });
    await queryInterface.addConstraint("mutasiAsets", {
      fields: ["penanggungjawabTujuanId"],
      type: "foreign key",
      name: "fk-mutasiAset-pjTujuan",
      references: { table: "pegawais", field: "id" },
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    });
  },

  async down(queryInterface) {
    if (await tableExists(queryInterface, "mutasiAsets")) {
      await queryInterface.dropTable("mutasiAsets");
    }
  },
};
