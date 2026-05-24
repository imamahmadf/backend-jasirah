const currentDate = new Date();

const profiles = [
  {
    createdAt: currentDate,
    updatedAt: currentDate,
    pegawaiId: 1,
    nama: "Siti Aminah",
    unitKerjaId: 1,
    userId: 2,
    id: 2,
  },
  {
    createdAt: currentDate,
    updatedAt: currentDate,
    pegawaiId: 2,
    nama: "Imam Ahmad Fahrurazi",
    unitKerjaId: 1,
    userId: 3,
    id: 3,
  },
  {
    createdAt: currentDate,
    updatedAt: currentDate,
    pegawaiId: 3,
    nama: "dela",
    unitKerjaId: 1,
    userId: 4,
    id: 4,
  },
  {
    createdAt: currentDate,
    updatedAt: currentDate,
    pegawaiId: 4,
    nama: "Pak Agus",
    unitKerjaId: 1,
    userId: 5,
    id: 5,
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("profiles", profiles, {
      updateOnDuplicate: ["nama", "userId", "unitKerjaId", "pegawaiId"],
    });
  },

  async down(queryInterface, Sequelize) {
    // biasanya tidak perlu rollback untuk data pegawai
  },
};
