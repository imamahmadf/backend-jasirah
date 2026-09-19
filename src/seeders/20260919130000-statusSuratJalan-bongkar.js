"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const [existing] = await queryInterface.sequelize.query(
      "SELECT id FROM statusSuratJalans WHERE id = 5 OR status = 'BONGKAR' LIMIT 1",
    );

    if (existing.length) return;

    const now = new Date();
    await queryInterface.bulkInsert("statusSuratJalans", [
      {
        id: 5,
        status: "BONGKAR",
        createdAt: now,
        updatedAt: now,
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("statusSuratJalans", { id: 5 });
  },
};
