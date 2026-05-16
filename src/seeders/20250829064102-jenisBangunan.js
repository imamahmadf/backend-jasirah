"use strict";

const currentDate = new Date();
const jenisBangunans = [
  { id: 1, jenis: "Puskesmas", createdAt: currentDate, updatedAt: currentDate },
  {
    id: 2,
    jenis: "Puban",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 3,
    jenis: "Poskesdes",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 4,
    jenis: "Rumah Dinas",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("jenisBangunans", jenisBangunans, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("jenisBangunans", null, {});
  },
};
