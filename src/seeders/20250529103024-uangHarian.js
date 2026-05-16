"use strict";

const currentDate = new Date();
const uangHarians = [
  {
    id: 1,
    nilai: 170000,

    createdAt: currentDate,
    updatedAt: currentDate,
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("uangHarians", uangHarians, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("uangHarians", null, {});
  },
};
