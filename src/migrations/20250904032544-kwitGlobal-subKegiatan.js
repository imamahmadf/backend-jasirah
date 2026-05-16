"use strict";

const constraintName = "fk-kwitGlobal-subKegiatan";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // Bersihkan data yang memiliki subKegiatanId yang tidak ada di tabel daftarSubKegiatans
      await queryInterface.sequelize.query(
        `UPDATE \`kwitGlobals\` 
         SET \`subKegiatanId\` = NULL 
         WHERE \`subKegiatanId\` IS NOT NULL 
         AND \`subKegiatanId\` NOT IN (SELECT id FROM \`daftarSubKegiatans\`)`
      );

      // Cek apakah constraint sudah ada
      const [constraints] = await queryInterface.sequelize.query(
        `SELECT CONSTRAINT_NAME as constraint_name 
         FROM information_schema.TABLE_CONSTRAINTS 
         WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME = 'kwitGlobals' 
         AND CONSTRAINT_NAME = '${constraintName}'`
      );

      if (constraints.length === 0) {
        await queryInterface.addConstraint("kwitGlobals", {
          fields: ["subKegiatanId"],
          type: "foreign key",
          name: constraintName,
          references: {
            //Required field
            table: "daftarSubKegiatans",
            field: "id",
          },
          onDelete: "cascade",
          onUpdate: "cascade",
        });
      }
    } catch (error) {
      console.log(`Error saat menambahkan constraint: ${error.message}`);
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      const [constraints] = await queryInterface.sequelize.query(
        `SELECT CONSTRAINT_NAME as constraint_name 
         FROM information_schema.TABLE_CONSTRAINTS 
         WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME = 'kwitGlobals' 
         AND CONSTRAINT_NAME = '${constraintName}'`
      );

      if (constraints.length > 0) {
        await queryInterface.removeConstraint("kwitGlobals", constraintName);
      }
    } catch (error) {
      console.log(`Constraint ${constraintName} tidak ditemukan, diabaikan.`);
    }
  },
};
