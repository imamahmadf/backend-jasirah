"use strict";

const currentDate = new Date();
const jenisAnggarans = [
  {
    createdAt: currentDate,
    updatedAt: currentDate,
    id: 1,
    jenis: "Anggaran Murni",
  },
  {
    createdAt: currentDate,
    updatedAt: currentDate,
    id: 2,
    jenis: "Anggaran Perubahan",
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("jenisAnggarans", jenisAnggarans, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("jenisAnggarans", null, {});
  },
};
