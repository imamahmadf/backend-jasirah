const currentDate = new Date();
const daftarTingkatans = [
  {
    id: 1,
    tingkatan: "Tingkat 1",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 2,
    tingkatan: "Tingkat 2",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 3,
    tingkatan: "Tingkat 3",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 4,
    tingkatan: "Tingkat 4",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("daftarTingkatans", daftarTingkatans, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("daftarTingkatans", null, {});
  },
};
