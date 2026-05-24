const currentDate = new Date();
const dalamKota = [
  {
    id: 1,
    nama: "Tempino Luar",
    uangTransport: 120000,
    durasi: 8,
    createdAt: currentDate,
    updatedAt: currentDate,
    indukUnitKerjaId: 1,
  },
  {
    id: 2,
    nama: "Tempino Dalam",
    uangTransport: 180000,
    durasi: 8,
    createdAt: currentDate,
    updatedAt: currentDate,
    indukUnitKerjaId: 1,
  },
  {
    id: 3,
    nama: "Tempino Besar",
    uangTransport: 210000,
    durasi: 8,
    createdAt: currentDate,
    updatedAt: currentDate,
    indukUnitKerjaId: 1,
  },
  {
    id: 4,
    nama: "Bajubang",
    uangTransport: 192000,
    durasi: 8,
    createdAt: currentDate,
    updatedAt: currentDate,
    indukUnitKerjaId: 1,
  },
  {
    id: 5,
    nama: "Wilayah Kerja Pertamina",
    uangTransport: 300000,
    durasi: 8,
    createdAt: currentDate,
    updatedAt: currentDate,
    indukUnitKerjaId: 1,
  },
  {
    id: 6,
    nama: "Sengeti",
    uangTransport: 240000,
    durasi: 8,
    createdAt: currentDate,
    updatedAt: currentDate,
    indukUnitKerjaId: 1,
  },
  {
    id: 7,
    nama: "Jambi",
    uangTransport: 90000,
    durasi: 8,
    createdAt: currentDate,
    updatedAt: currentDate,
    indukUnitKerjaId: 1,
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("dalamKota", dalamKota, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("dalamKota", null, {});
  },
};
