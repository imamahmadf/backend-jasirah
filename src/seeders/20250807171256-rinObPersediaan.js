const currentDate = new Date();
const rinObPersediaans = [
  {
    id: 1,
    obPersediaanId: 1,
    createdAt: currentDate,
    updatedAt: currentDate,
    nama: "Bahan",
    kode: "01",
  },
  {
    id: 2,
    obPersediaanId: 1,
    createdAt: currentDate,
    updatedAt: currentDate,
    nama: "Suku Cadang",
    kode: "02",
  },
  {
    id: 3,
    obPersediaanId: 1,
    createdAt: currentDate,
    updatedAt: currentDate,
    nama: "Alat/Bahan untuk Kegiatan Kantor",
    kode: "03",
  },
  {
    id: 4,
    obPersediaanId: 1,
    createdAt: currentDate,
    updatedAt: currentDate,
    nama: "Persediaan untuk Dijual/Diserahkan",
    kode: "05",
  },
  {
    id: 5,
    obPersediaanId: 1,
    createdAt: currentDate,
    updatedAt: currentDate,
    nama: "Persediaan untuk Tujuan Strategis/Berjaga-jaga",
    kode: "06",
  },
  {
    id: 6,
    obPersediaanId: 1,
    createdAt: currentDate,
    updatedAt: currentDate,
    nama: "Natura dan Pakan",
    kode: "07",
  },
  {
    id: 7,
    obPersediaanId: 1,
    createdAt: currentDate,
    updatedAt: currentDate,
    nama: "Persediaan Penelitian",
    kode: "08",
  },
  {
    id: 8,
    obPersediaanId: 1,
    createdAt: currentDate,
    updatedAt: currentDate,
    nama: "Persediaan Dalam Proses",
    kode: "09",
  },
  {
    id: 9,
    obPersediaanId: 2,
    createdAt: currentDate,
    updatedAt: currentDate,
    nama: "Komponen",
    kode: "01",
  },
  {
    id: 10,
    obPersediaanId: 2,
    createdAt: currentDate,
    updatedAt: currentDate,
    nama: "Pipa",
    kode: "02",
  },
  {
    id: 11,
    obPersediaanId: 3,
    createdAt: currentDate,
    updatedAt: currentDate,
    nama: "Komponen Bekas dan Pipa Bekas",
    kode: "01",
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("rinObPersediaans", rinObPersediaans, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("rinObPersediaans", null, {});
  },
};
