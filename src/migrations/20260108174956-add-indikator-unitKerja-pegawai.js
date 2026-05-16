"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Cek apakah tabel indikators ada
      const [tables] = await queryInterface.sequelize.query(
        `SELECT TABLE_NAME 
         FROM information_schema.TABLES 
         WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME = 'indikators'`
      );

      if (tables.length > 0) {
        // Cek apakah kolom unitKerjaId sudah ada
        const [columnsUnitKerja] = await queryInterface.sequelize.query(
          `SELECT COLUMN_NAME 
           FROM information_schema.COLUMNS 
           WHERE TABLE_SCHEMA = DATABASE()
           AND TABLE_NAME = 'indikators' 
           AND COLUMN_NAME = 'unitKerjaId'`
        );

        if (columnsUnitKerja.length === 0) {
          await queryInterface.addColumn("indikators", "unitKerjaId", {
            type: Sequelize.INTEGER,
            allowNull: true,
          });
        }

        // Cek apakah kolom pegawaiId sudah ada
        const [columnsPegawai] = await queryInterface.sequelize.query(
          `SELECT COLUMN_NAME 
           FROM information_schema.COLUMNS 
           WHERE TABLE_SCHEMA = DATABASE()
           AND TABLE_NAME = 'indikators' 
           AND COLUMN_NAME = 'pegawaiId'`
        );

        if (columnsPegawai.length === 0) {
          await queryInterface.addColumn("indikators", "pegawaiId", {
            type: Sequelize.INTEGER,
            allowNull: true,
          });
        }
      }
    } catch (error) {
      console.log(`Error saat menambahkan kolom: ${error.message}`);
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      // Cek apakah tabel indikators ada
      const [tables] = await queryInterface.sequelize.query(
        `SELECT TABLE_NAME 
         FROM information_schema.TABLES 
         WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME = 'indikators'`
      );

      if (tables.length > 0) {
        // Cek apakah kolom pegawaiId ada sebelum menghapus
        const [columnsPegawai] = await queryInterface.sequelize.query(
          `SELECT COLUMN_NAME 
           FROM information_schema.COLUMNS 
           WHERE TABLE_SCHEMA = DATABASE()
           AND TABLE_NAME = 'indikators' 
           AND COLUMN_NAME = 'pegawaiId'`
        );

        if (columnsPegawai.length > 0) {
          await queryInterface.removeColumn("indikators", "pegawaiId");
        }

        // Cek apakah kolom unitKerjaId ada sebelum menghapus
        const [columnsUnitKerja] = await queryInterface.sequelize.query(
          `SELECT COLUMN_NAME 
           FROM information_schema.COLUMNS 
           WHERE TABLE_SCHEMA = DATABASE()
           AND TABLE_NAME = 'indikators' 
           AND COLUMN_NAME = 'unitKerjaId'`
        );

        if (columnsUnitKerja.length > 0) {
          await queryInterface.removeColumn("indikators", "unitKerjaId");
        }
      }
    } catch (error) {
      console.log(`Error saat menghapus kolom: ${error.message}`);
      // Abaikan error jika tabel tidak ada
    }
  },
};
