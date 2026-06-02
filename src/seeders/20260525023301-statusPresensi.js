"use strict";

const currentDate = new Date();
const statusPresensis = [
  {
    createdAt: currentDate,
    updatedAt: currentDate,
    id: 1,
    nama: "masuk",
  },
  {
    createdAt: currentDate,
    updatedAt: currentDate,
    id: 2,
    nama: "pulang lebih awal",
  },
  {
    createdAt: currentDate,
    updatedAt: currentDate,
    id: 3,
    nama: "sakit",
  },
  {
    createdAt: currentDate,
    updatedAt: currentDate,
    id: 4,
    nama: "izin",
  },
  {
    createdAt: currentDate,
    updatedAt: currentDate,
    id: 5,
    nama: "lembur",
  },
  {
    createdAt: currentDate,
    updatedAt: currentDate,
    id: 6,
    nama: "tampa keterangan",
  },
  {
    createdAt: currentDate,
    updatedAt: currentDate,
    id: 7,
    nama: "libur",
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("statusPresensis", statusPresensis, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("statusPresensis", null, {});
  },
};
