"use strict";

const currentDate = new Date();
const roleKPBPNs = [
  {
    id: 1,
    name: "Super Admin",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 2,
    name: "Admin",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  { id: 3, name: "Mitra", createdAt: currentDate, updatedAt: currentDate },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("roleKPBPNs", roleKPBPNs, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("roleKPBPNs", null, {});
  },
};
