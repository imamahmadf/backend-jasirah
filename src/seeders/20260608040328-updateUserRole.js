"use strict";

const currentDate = new Date();

module.exports = {
  async up(queryInterface, Sequelize) {
    // Ambil semua user
    const users = await queryInterface.sequelize.query(
      `SELECT id FROM users WHERE deletedAt IS NULL`,
      { type: Sequelize.QueryTypes.SELECT },
    );

    const userRoles = [];

    for (const user of users) {
      if (user.id === 1) {
        // userId 1 → role 1 & 5
        userRoles.push(
          {
            userId: 1,
            roleId: 1,
            createdAt: currentDate,
            updatedAt: currentDate,
          },
          {
            userId: 1,
            roleId: 5,
            createdAt: currentDate,
            updatedAt: currentDate,
          },
        );
      } else {
        // Semua user lain → role 9
        userRoles.push({
          userId: user.id,
          roleId: 9,
          createdAt: currentDate,
          updatedAt: currentDate,
        });
      }
    }

    await queryInterface.bulkInsert("userRoles", userRoles, {
      updateOnDuplicate: ["roleId", "updatedAt"],
    });

    console.log(`✅ ${userRoles.length} userRole berhasil disinkronisasi`);
  },

  async down(queryInterface, Sequelize) {
    // Biasanya tidak rollback
  },
};
