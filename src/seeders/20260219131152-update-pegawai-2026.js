const currentDate = new Date();

const pegawais = [
  {
    createdAt: currentDate,
    updatedAt: currentDate,
    id: 1,
    nip: "001",
    NIK: "",
    nama: "Siti Aminah",

    jabatan: "Direktur",
    unitKerjaId: 1,
    pendidikan: "-",
    statusPegawaiId: 1,
    profesiId: 1,
    tanggalTMT: null,
  },
  {
    createdAt: currentDate,
    updatedAt: currentDate,
    id: 2,
    nip: "002",
    NIK: "",
    nama: "Imam Ahmad Fahrurazi",

    jabatan: "General Manager",
    unitKerjaId: 1,
    pendidikan: "S-2",
    statusPegawaiId: 1,
    profesiId: 1,
    tanggalTMT: null,
  },
  {
    createdAt: currentDate,
    updatedAt: currentDate,
    id: 3,
    nip: "003",
    NIK: "",
    nama: "dela",

    jabatan: "Financial Manager",
    unitKerjaId: 1,
    pendidikan: "x",
    statusPegawaiId: 1,
    profesiId: 1,
    tanggalTMT: null,
  },
  {
    createdAt: currentDate,
    updatedAt: currentDate,
    id: 4,
    nip: "004",
    NIK: "",
    nama: "Pak Agus",

    jabatan: "Operasional Manager",
    unitKerjaId: 1,
    pendidikan: "x",
    statusPegawaiId: 1,
    profesiId: 1,
    tanggalTMT: null,
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("pegawais", pegawais, {
      updateOnDuplicate: [
        "nip",
        "nik",
        "nama",
        "pendidikan",

        "jabatan",
        "unitKerjaId",
        "statusPegawaiId",
        "profesiId",
        "tanggalTMT",
        "updatedAt",
      ],
    });
  },

  async down(queryInterface, Sequelize) {
    // biasanya tidak perlu rollback untuk data pegawai
  },
};
