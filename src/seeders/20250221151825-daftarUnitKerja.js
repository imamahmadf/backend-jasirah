const currentDate = new Date();
const daftarUnitKerjas = [
  {
    id: "1",
    unitKerja: "Kesekretariatan",
    indukUnitKerjaId: "1",
    createdAt: currentDate,
    updatedAt: currentDate,
    kode: "SKRT.1",
  },

  {
    id: "2",
    unitKerja: "Divisi Keuangan",
    indukUnitKerjaId: "1",
    createdAt: currentDate,
    updatedAt: currentDate,
    kode: "D.KEU",
  },

  {
    id: "8",
    unitKerja: "Koperasi Produsen Batanghari Patra Nusantara",
    indukUnitKerjaId: "2",
    createdAt: currentDate,
    updatedAt: currentDate,
    kode: "KPBPN",
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("daftarUnitKerjas", daftarUnitKerjas, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("daftarUnitKerjas", null, {});
  },
};
