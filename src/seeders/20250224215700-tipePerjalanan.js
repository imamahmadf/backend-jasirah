"use strict";

const currentDate = new Date();
const tipePerjalanans = [
  {
    id: 1,
    tipe: "Dalam Daerah",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 2,
    tipe: "Luar Daerah",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("tipePerjalanans", tipePerjalanans, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("tipePerjalanans", null, {});
  },
};
