"use strict";

const currentDate = new Date();
const kondisiBangunans = [
  {
    id: 1,
    kondisi: "Baik",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 2,
    kondisi: "Rusak Ringan",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 3,
    kondisi: "Rusak Berat",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("kondisiBangunans", kondisiBangunans, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("kondisiBangunans", null, {});
  },
};
