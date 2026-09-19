"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const [existing] = await queryInterface.sequelize.query(
      "SELECT id FROM roleKPBPNs WHERE id = 4 LIMIT 1",
    );

    if (existing.length) return;

    const now = new Date();
    await queryInterface.bulkInsert("roleKPBPNs", [
      {
        id: 4,
        name: "Keuangan",
        createdAt: now,
        updatedAt: now,
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("roleKPBPNs", { id: 4 });
  },
};
