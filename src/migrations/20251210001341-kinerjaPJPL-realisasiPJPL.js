"use strict";

const constraintName = "fk-kinerjaPJPL-realisasiPJPL";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // Cek apakah kolom realisasiPJPLId masih ada
      const [columns] = await queryInterface.sequelize.query(
        `SELECT column_name 
         FROM information_schema.columns 
         WHERE table_name = 'kinerjaPJPLs' 
         AND column_name = 'realisasiPJPLId'`
      );

      if (columns.length === 0) {
        console.log(
          "Kolom realisasiPJPLId tidak ditemukan di tabel kinerjaPJPLs, constraint diabaikan."
        );
        return;
      }

      // Cek apakah constraint sudah ada
      const [constraints] = await queryInterface.sequelize.query(
        `SELECT constraint_name 
         FROM information_schema.table_constraints 
         WHERE table_name = 'kinerjaPJPLs' 
         AND constraint_name = '${constraintName}'`
      );

      if (constraints.length === 0) {
        await queryInterface.addConstraint("kinerjaPJPLs", {
          fields: ["realisasiPJPLId"],
          type: "foreign key",
          name: constraintName,
          references: {
            //Required field
            table: "realisasiPJPLs",
            field: "id",
          },
          onDelete: "cascade",
          onUpdate: "cascade",
        });
      }
    } catch (error) {
      console.log(`Error saat menambahkan constraint: ${error.message}`);
      // Abaikan error jika constraint sudah ada atau kolom tidak ada
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      // Cek apakah constraint ada sebelum menghapus
      const [constraints] = await queryInterface.sequelize.query(
        `SELECT constraint_name 
         FROM information_schema.table_constraints 
         WHERE table_name = 'kinerjaPJPLs' 
         AND constraint_name = '${constraintName}'`
      );

      if (constraints.length > 0) {
        await queryInterface.removeConstraint("kinerjaPJPLs", constraintName);
      }
    } catch (error) {
      // Jika constraint tidak ada, abaikan error
      console.log(`Constraint ${constraintName} tidak ditemukan, diabaikan.`);
    }
  },
};
