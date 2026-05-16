"use strict";

const currentDate = new Date();
const userRoles = [
  {
    id: 1,
    userId: 1,
    roleId: 1,
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 2,
    userId: 1,
    roleId: 5,
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 3,
    userId: 1,
    roleId: 2,
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 4,
    userId: 1,
    roleId: 3,
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 5,
    userId: 1,
    roleId: 4,
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 6,
    userId: 1,
    roleId: 6,
    createdAt: currentDate,
    updatedAt: currentDate,
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("userRoles", userRoles, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("userRoles", null, {});
  },
};
