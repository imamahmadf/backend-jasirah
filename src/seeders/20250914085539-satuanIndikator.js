"use strict";

const currentDate = new Date();
const satuanIndikators = [
  {
    createdAt: currentDate,
    updatedAt: currentDate,
    id: 1,
    satuan: "orang",
  },
  {
    createdAt: currentDate,
    updatedAt: currentDate,
    id: 2,
    satuan: "paket",
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("satuanIndikators", satuanIndikators, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("satuanIndikators", null, {});
  },
};
