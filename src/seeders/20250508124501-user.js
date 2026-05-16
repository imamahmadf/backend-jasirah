"use strict";

const currentDate = new Date();
const users = [
  {
    id: 1,
    nama: "admin dinkes",
    namaPengguna: "admin",
    password: "$2b$10$gtOTvRQnBz4FibTWDCWEiOgrti8BAk1bg2arHubTea2WapX0JSc1a",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("users", users, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("users", null, {});
  },
};
