"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const roles = [
      { id: 6, name: "Supervisor" },
      { id: 7, name: "General Affair" },
      { id: 8, name: "HR" },
      { id: 9, name: "General Manager" },
    ];

    for (const role of roles) {
      const [existing] = await queryInterface.sequelize.query(
        "SELECT id FROM roleKPBPNs WHERE id = :id OR name = :name LIMIT 1",
        { replacements: { id: role.id, name: role.name } },
      );
      if (existing.length) continue;
      await queryInterface.bulkInsert("roleKPBPNs", [
        {
          id: role.id,
          name: role.name,
          createdAt: now,
          updatedAt: now,
        },
      ]);
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("roleKPBPNs", { id: [6, 7, 8, 9] });
  },
};
