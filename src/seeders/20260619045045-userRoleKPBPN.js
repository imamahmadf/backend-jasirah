"use strict";

const currentDate = new Date();
const userRoleKPBPNs = [
  {
    id: 1,
    userKPBPNId: 1,
    roleKPBPNId: 1,
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 2,
    userKPBPNId: 1,
    roleKPBPNId: 2,
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 3,
    userKPBPNId: 1,
    roleKPBPNId: 3,
    createdAt: currentDate,
    updatedAt: currentDate,
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("userRoleKPBPNs", userRoleKPBPNs, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("userRoleKPBPNs", null, {});
  },
};
