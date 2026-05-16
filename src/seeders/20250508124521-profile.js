"use strict";

const currentDate = new Date();
const profiles = [
  {
    id: 1,
    nama: "admin dinkes",
    userId: 1,
    unitKerjaId: 1,
    createdAt: currentDate,
    updatedAt: currentDate,
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("profiles", profiles, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("profiles", null, {});
  },
};
