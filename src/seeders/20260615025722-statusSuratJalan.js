"use strict";

const currentDate = new Date();
const statusSuratJalans = [
  {
    createdAt: currentDate,
    updatedAt: currentDate,
    status: "DRAFT",
    id: 1,
  },
  {
    createdAt: currentDate,
    updatedAt: currentDate,
    status: "KIRIM",
    id: 2,
  },

  {
    createdAt: currentDate,
    updatedAt: currentDate,
    status: "TIBA",
    id: 3,
  },
  {
    createdAt: currentDate,
    updatedAt: currentDate,
    status: "BATAL",
    id: 4,
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("statusSuratJalans", statusSuratJalans, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("statusSuratJalans", null, {});
  },
};
