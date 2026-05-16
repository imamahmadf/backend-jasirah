"use strict";

const constraintName = "fk-kwitGlobal-jenisPerjalanan";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // Bersihkan data yang memiliki jenisPerjalananId yang tidak ada di tabel jenisPerjalanans
      await queryInterface.sequelize.query(
        `UPDATE \`kwitGlobals\` 
         SET \`jenisPerjalananId\` = NULL 
         WHERE \`jenisPerjalananId\` IS NOT NULL 
         AND \`jenisPerjalananId\` NOT IN (SELECT id FROM \`jenisPerjalanans\`)`
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
          fields: ["jenisPerjalananId"],
          type: "foreign key",
          name: constraintName,
          references: {
            //Required field
            table: "jenisPerjalanans",
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
