"use strict";

const currentDate = new Date();
const bcrypt = require("bcryptjs");

const users = [
  {
    createdAt: currentDate,
    updatedAt: currentDate,
    id: 2,
    namaPengguna: "001",
    password: bcrypt.hashSync("jamtos", 10),
    nama: "Siti Aminah",
  },
  {
    createdAt: currentDate,
    updatedAt: currentDate,
    id: 3,
    namaPengguna: "002",
    password: bcrypt.hashSync("jamtos", 10),
    nama: "Imam Ahmad Fahrurazi",
  },
  {
    createdAt: currentDate,
    updatedAt: currentDate,
    id: 4,
    namaPengguna: "003",
    password: bcrypt.hashSync("jamtos", 10),
    nama: "Dela Anak Bu Situ",
  },
  {
    createdAt: currentDate,
    updatedAt: currentDate,
    id: 5,
    namaPengguna: "004",
    password: bcrypt.hashSync("jamtos", 10),
    nama: "Pak Agus",
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("users", users, {
      updateOnDuplicate: ["nama", "namaPengguna", "password", "updatedAt"],
    });
  },

  async down(queryInterface, Sequelize) {
    // Tidak perlu rollback untuk user production
  },
};
