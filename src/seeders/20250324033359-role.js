"use strict";

const currentDate = new Date();
const roles = [
  { id: 1, nama: "User", createdAt: currentDate, updatedAt: currentDate },
  {
    id: 2,
    nama: "Admin Unit Kerja",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  { id: 3, nama: "keuangan", createdAt: currentDate, updatedAt: currentDate },
  {
    id: 4,
    nama: "Pencatat Surat",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 5,
    nama: "Super Admin",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 6,
    nama: "Admin Kepala Dinas",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 7,
    nama: "Kepegawaian",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 8,
    nama: "admin aset",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 9,
    nama: "pegawai",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 10,
    nama: "aset",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 11,
    nama: "perencanaan",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 12,
    nama: "admin perencanaan",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("roles", roles, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("roles", null, {});
  },
};
