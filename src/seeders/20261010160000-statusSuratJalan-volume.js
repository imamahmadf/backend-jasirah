"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const [existing] = await queryInterface.sequelize.query(
      "SELECT id FROM statusSuratJalans WHERE id = 6 OR status = 'VOLUME' LIMIT 1",
    );

    if (existing.length) return;

    const now = new Date();
    await queryInterface.bulkInsert("statusSuratJalans", [
      {
        id: 6,
        status: "VOLUME",
        createdAt: now,
        updatedAt: now,
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("statusSuratJalans", { id: 6 });
  },
};
