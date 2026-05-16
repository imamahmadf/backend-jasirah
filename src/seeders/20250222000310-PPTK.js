const currentDate = new Date();
const PPTKs = [
  {
    id: 1,
    jabatan: "pejabat pelaksana teknis",
    unitKerjaId: 1,
    pegawaiId: 6,

    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 2,
    jabatan: "pejabat pelaksana teknis",
    unitKerjaId: 1,
    pegawaiId: 2,

    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 3,
    jabatan: "pejabat pelaksana teknis",
    unitKerjaId: 1,
    pegawaiId: 1,

    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 4,
    jabatan: "pejabat pelaksana teknis",
    unitKerjaId: 5,
    pegawaiId: 3,

    createdAt: currentDate,
    updatedAt: currentDate,
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("PPTKs", PPTKs, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("PPTKs", null, {});
  },
};
