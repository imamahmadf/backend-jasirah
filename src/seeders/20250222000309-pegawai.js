const currentDate = new Date();
const pegawais = [
  {
    id: 1,
    nip: "19840726 200212 1 001",
    nik: "-",
    nama: "Amri Yulihardi, S.Stp, M.Si",
    jabatan: "Kepala Dinas",
    unitKerjaId: 1,
    pendidikan: "S-2 ADMINISTRASI PEMERINTAHAN DAERAH",
    statusPegawaiId: 1,
    profesiId: 1,
    createdAt: currentDate,
    updatedAt: currentDate,
    tanggalTMT: "2024-10-01",
  },
  {
    id: 2,
    nip: "19710417 199703 2 001",
    nik: "-",
    nama: "Alfrienti Linggi Kalalembang, Skm, M.Kes",
    jabatan: "Kepala Bidang Pelayanan Kesehatan",
    unitKerjaId: 1,
    pendidikan: "S-2 MAGISTER KESEHATAN",
    statusPegawaiId: 1,
    profesiId: 1,
    createdAt: currentDate,
    updatedAt: currentDate,
    tanggalTMT: "2013-10-01",
  },
  {
    id: 3,
    nip: "19751212 200212 2 004",
    nik: "-",
    nama: "Dr. Ainun Jariyah",
    jabatan: "Kepala Bidang Pencegahan dan Pengendalian Penyakit",
    unitKerjaId: 1,
    pendidikan: "KEDOKTERAN UMUM + PROFESI",
    statusPegawaiId: 1,
    profesiId: 1,
    createdAt: currentDate,
    updatedAt: currentDate,
    tanggalTMT: "2015-10-01",
  },
  {
    id: 4,
    nip: "19760410 200502 2 001",
    nik: "-",
    nama: "Sulistiyo Rini, S.Si.Apt",
    jabatan: "Administrator Kesehatan Ahli Madya",
    unitKerjaId: 1,
    pendidikan: "S-2 FARMASI APOTEKER",
    statusPegawaiId: 1,
    profesiId: 1,
    createdAt: currentDate,
    updatedAt: currentDate,
    tanggalTMT: "2017-10-01",
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("pegawais", pegawais, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("pegawais", null, {});
  },
};
