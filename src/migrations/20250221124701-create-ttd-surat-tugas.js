"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "ttdSuratTugas",
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        // nama: {
        //   type: Sequelize.STRING,
        // },
        jabatan: {
          type: Sequelize.STRING,
        },
        // pangkat: {
        //   type: Sequelize.STRING,
        // },
        // golongan: {
        //   type: Sequelize.STRING,
        // },
        // nip: {
        //   type: Sequelize.STRING,
        // },
        pegawaiId: {
          type: Sequelize.INTEGER,
        },
        indukUnitKerjaId: {
          type: Sequelize.INTEGER,
        },
        deletedAt: {
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
      },
      {
        paranoid: true,
        deletedAt: "soft_delete",
      }
    );
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("ttdSuratTugas");
  },
};
