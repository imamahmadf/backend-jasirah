"use strict";

const currentDate = new Date();
const profesis = [
  {
    nama: "Manajerial",
    createdAt: currentDate,
    updatedAt: currentDate,
    id: 1,
  },
  {
    nama: "Pengawas",
    createdAt: currentDate,
    updatedAt: currentDate,
    id: 2,
  },
  {
    nama: "Tukang",
    createdAt: currentDate,
    updatedAt: currentDate,
    id: 3,
  },
  {
    nama: "Kenek",
    createdAt: currentDate,
    updatedAt: currentDate,
    id: 4,
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("profesis", profesis, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("profesis", null, {});
  },
};
