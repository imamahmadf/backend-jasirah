"use strict";

const constraintNameUnitKerja = "fk-indikator-unitKerja";
const constraintNamePegawai = "fk-indikator-pegawai";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // Cek apakah constraint unitKerjaId sudah ada
      const [constraintsUnitKerja] = await queryInterface.sequelize.query(
        `SELECT CONSTRAINT_NAME as constraint_name 
         FROM information_schema.TABLE_CONSTRAINTS 
         WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME = 'indikators' 
         AND CONSTRAINT_NAME = '${constraintNameUnitKerja}'`
      );

      if (constraintsUnitKerja.length === 0) {
        // Menambahkan foreign key constraint untuk unitKerjaId
        await queryInterface.addConstraint("indikators", {
          fields: ["unitKerjaId"],
          type: "foreign key",
          name: constraintNameUnitKerja,
          references: {
            table: "daftarUnitKerjas",
            field: "id",
          },
          onDelete: "cascade",
          onUpdate: "cascade",
        });
      }
    } catch (error) {
      console.log(
        `Error saat menambahkan constraint ${constraintNameUnitKerja}: ${error.message}`
      );
    }

    try {
      // Cek apakah constraint pegawaiId sudah ada
      const [constraintsPegawai] = await queryInterface.sequelize.query(
        `SELECT CONSTRAINT_NAME as constraint_name 
         FROM information_schema.TABLE_CONSTRAINTS 
         WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME = 'indikators' 
         AND CONSTRAINT_NAME = '${constraintNamePegawai}'`
      );

      if (constraintsPegawai.length === 0) {
        // Menambahkan foreign key constraint untuk pegawaiId
        await queryInterface.addConstraint("indikators", {
          fields: ["pegawaiId"],
          type: "foreign key",
          name: constraintNamePegawai,
          references: {
            table: "pegawais",
            field: "id",
          },
          onDelete: "cascade",
          onUpdate: "cascade",
        });
      }
    } catch (error) {
      console.log(
        `Error saat menambahkan constraint ${constraintNamePegawai}: ${error.message}`
      );
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      // Cek apakah constraint pegawaiId ada sebelum menghapus
      const [constraintsPegawai] = await queryInterface.sequelize.query(
        `SELECT CONSTRAINT_NAME as constraint_name 
         FROM information_schema.TABLE_CONSTRAINTS 
         WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME = 'indikators' 
         AND CONSTRAINT_NAME = '${constraintNamePegawai}'`
      );

      if (constraintsPegawai.length > 0) {
        await queryInterface.removeConstraint(
          "indikators",
          constraintNamePegawai
        );
      }
    } catch (error) {
      console.log(
        `Constraint ${constraintNamePegawai} tidak ditemukan, diabaikan.`
      );
    }

    try {
      // Cek apakah constraint unitKerjaId ada sebelum menghapus
      const [constraintsUnitKerja] = await queryInterface.sequelize.query(
        `SELECT CONSTRAINT_NAME as constraint_name 
         FROM information_schema.TABLE_CONSTRAINTS 
         WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME = 'indikators' 
         AND CONSTRAINT_NAME = '${constraintNameUnitKerja}'`
      );

      if (constraintsUnitKerja.length > 0) {
        await queryInterface.removeConstraint(
          "indikators",
          constraintNameUnitKerja
        );
      }
    } catch (error) {
      console.log(
        `Constraint ${constraintNameUnitKerja} tidak ditemukan, diabaikan.`
      );
    }
  },
};
