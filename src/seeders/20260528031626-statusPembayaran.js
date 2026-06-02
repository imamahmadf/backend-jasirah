"use strict";

const currentDate = new Date();
const statusPembayarans = [
  {
    createdAt: currentDate,
    updatedAt: currentDate,
    id: 1,
    nama: "paid",
  },
  {
    createdAt: currentDate,
    updatedAt: currentDate,
    id: 2,
    nama: "reimburse",
  },

  {
    createdAt: currentDate,
    updatedAt: currentDate,
    id: 3,
    nama: "payble",
  },
  {
    createdAt: currentDate,
    updatedAt: currentDate,
    id: 4,
    nama: "receivable",
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("statusPembayarans", statusPembayarans, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("statusPembayarans", null, {});
  },
};
