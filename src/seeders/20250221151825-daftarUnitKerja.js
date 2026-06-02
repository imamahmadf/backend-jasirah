const currentDate = new Date();
const daftarUnitKerjas = [
  {
    id: "1",
    unitKerja: "Jasirah",
    indukUnitKerjaId: "1",
    createdAt: currentDate,
    updatedAt: currentDate,
    kode: "JDB",
  },

  {
    id: "2",
    unitKerja: "Grand Diza Residence",
    indukUnitKerjaId: "1",
    createdAt: currentDate,
    updatedAt: currentDate,
    kode: "GDR",
  },

  {
    id: "3",
    unitKerja: "Koperasi Produsen Batanghari Patra Nusantara",
    indukUnitKerjaId: "2",
    createdAt: currentDate,
    updatedAt: currentDate,
    kode: "KPBPN",
  },
  {
    id: "4",
    unitKerja: "Tempino Dalam",
    indukUnitKerjaId: "2",
    createdAt: currentDate,
    updatedAt: currentDate,
    kode: "TEMD",
  },
  {
    id: "5",
    unitKerja: "Tempino Luar",
    indukUnitKerjaId: "2",
    createdAt: currentDate,
    updatedAt: currentDate,
    kode: "TEML",
  },

  {
    id: "6",
    unitKerja: "Koperasi Produsen Batanghari Sumber Energi",
    indukUnitKerjaId: "3",
    createdAt: currentDate,
    updatedAt: currentDate,
    kode: "KPBSE",
  },

  {
    id: "7",
    unitKerja: "Wilayah kerja Pertamina",
    indukUnitKerjaId: "3",
    createdAt: currentDate,
    updatedAt: currentDate,
    kode: "WKP",
  },
  {
    id: "8",
    unitKerja: "Burung Hantu",
    indukUnitKerjaId: "4",
    createdAt: currentDate,
    updatedAt: currentDate,
    kode: "BURHAN",
  },
  {
    id: "9",
    unitKerja: "Kantor",
    indukUnitKerjaId: "1",
    createdAt: currentDate,
    updatedAt: currentDate,
    kode: "KTR",
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
