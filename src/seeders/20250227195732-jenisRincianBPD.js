const currentDate = new Date();
const jenisRincianBPDs = [
  {
    id: 1,
    jenis: "Uang Harian",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 2,
    jenis: "Representatif",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 3,
    jenis: "Akomodasi",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 4,
    jenis: "Transportasi",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 5,
    jenis: "Rill",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("jenisRincianBPDs", jenisRincianBPDs, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("jenisRincianBPDs", null, {});
  },
};
