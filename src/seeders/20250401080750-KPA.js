const currentDate = new Date();
const KPAs = [
  {
    id: 1,

    unitKerjaId: 1,
    pegawaiId: 6,
    jabatan: "kuasa Pengguna Anggaran",

    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 2,

    unitKerjaId: 1,
    pegawaiId: 2,
    jabatan: "Kuasa Pengguna Anggaran",

    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 3,

    unitKerjaId: 1,
    pegawaiId: 1,
    jabatan: "Pengguna Anggaran",

    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 4,

    unitKerjaId: 5,
    pegawaiId: 3,
    jabatan: "Pengguna Anggaran",

    createdAt: currentDate,
    updatedAt: currentDate,
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("KPAs", KPAs, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("KPAs", null, {});
  },
};
