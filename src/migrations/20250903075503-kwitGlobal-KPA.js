"use strict";

const constraintName = "fk-kwitGlobal-KPA";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // Bersihkan data yang memiliki KPAId yang tidak ada di tabel kpas
      // Set KPAId menjadi NULL untuk data yang tidak valid
      await queryInterface.sequelize.query(
        `UPDATE \`kwitGlobals\` 
         SET \`KPAId\` = NULL 
         WHERE \`KPAId\` IS NOT NULL 
         AND \`KPAId\` NOT IN (SELECT id FROM \`kpas\`)`
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
          fields: ["KPAId"],
          type: "foreign key",
          name: constraintName,
          references: {
            //Required field
            table: "kpas",
            field: "id",
          },
          onDelete: "cascade",
          onUpdate: "cascade",
        });
      }
    } catch (error) {
      console.log(`Error saat menambahkan constraint: ${error.message}`);
      // Abaikan error jika constraint sudah ada
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      // Cek apakah constraint ada sebelum menghapus
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
      // Jika constraint tidak ada, abaikan error
      console.log(`Constraint ${constraintName} tidak ditemukan, diabaikan.`);
    }
  },
};
