"use strict";

const currentDate = new Date();
const statusKendaraans = [
  { id: 1, status: "Lunas", createdAt: currentDate, updatedAt: currentDate },
  {
    id: 2,
    status: "Belum dibayarkan",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 3,
    status: "Menunggak",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("statusKendaraans", statusKendaraans, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("statusKendaraans", null, {});
  },
};
