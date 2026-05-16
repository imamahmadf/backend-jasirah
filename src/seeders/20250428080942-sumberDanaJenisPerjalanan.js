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
    id: 5,
    jenisPerjalananId: 3,
    sumberDanaId: 1,
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 6,
    jenisPerjalananId: 3,
    sumberDanaId: 2,
    createdAt: currentDate,
    updatedAt: currentDate,
  },

  {
    id: 7,
    jenisPerjalananId: 4,
    sumberDanaId: 3,
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 8,
    jenisPerjalananId: 5,
    sumberDanaId: 3,
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 9,
    jenisPerjalananId: 6,
    sumberDanaId: 3,
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 10,
    jenisPerjalananId: 1,
    sumberDanaId: 4,
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 11,
    jenisPerjalananId: 2,
    sumberDanaId: 4,
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
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("sumberDanaJenisPerjalanans", null, {});
  },
};
