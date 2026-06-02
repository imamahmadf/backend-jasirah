"use strict";

const currentDate = new Date();
const metodePembayarans = [
  {
    createdAt: currentDate,
    updatedAt: currentDate,
    id: 1,
    nama: "cash",
  },
  {
    createdAt: currentDate,
    updatedAt: currentDate,
    id: 2,
    nama: "transfer",
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("metodePembayarans", metodePembayarans, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("metodePembayarans", null, {});
  },
};
