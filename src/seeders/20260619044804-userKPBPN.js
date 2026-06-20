"use strict";

const currentDate = new Date();
const bcrypt = require("bcryptjs");
const userKPBPNs = [
  {
    id: 1,
    nama: "admin KPBPN",
    namaPengguna: "admin",
    password: bcrypt.hashSync("jamtos", 10),
    createdAt: currentDate,
    updatedAt: currentDate,
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("userKPBPNs", userKPBPNs, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("userKPBPNs", null, {});
  },
};
