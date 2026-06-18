"use strict";

const currentDate = new Date();
const jenisTransportirs = [
  {
    createdAt: currentDate,
    updatedAt: currentDate,
    jenis: "Truk Tanki",

    id: 1,
  },
  {
    createdAt: currentDate,
    updatedAt: currentDate,
    jenis: "Kendaraan Angkut",

    id: 2,
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("jenisTransportirs", jenisTransportirs, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("jenisTransportirs", null, {});
  },
};
