"use strict";

const currentDate = new Date();
const sumberDanaJenisPerjalanans = [
  {
    id: 1,
    jenisPerjalananId: 1,
    sumberDanaId: 1,
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 2,
    jenisPerjalananId: 1,
    sumberDanaId: 2,
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 3,
    jenisPerjalananId: 2,
    sumberDanaId: 1,
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 4,
    jenisPerjalananId: 2,
    sumberDanaId: 2,
    createdAt: currentDate,
    updatedAt: currentDate,
  },

  {
    id: 10,
    jenisPerjalananId: 1,
    sumberDanaId: 2,
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 11,
    jenisPerjalananId: 2,
    sumberDanaId: 2,
    createdAt: currentDate,
    updatedAt: currentDate,
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "sumberDanaJenisPerjalanans",
      sumberDanaJenisPerjalanans,
      {},
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("sumberDanaJenisPerjalanans", null, {});
  },
};
