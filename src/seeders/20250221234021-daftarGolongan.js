const currentDate = new Date();
const daftarGolongans = [
  {
    id: "1",

    createdAt: currentDate,
    updatedAt: currentDate,
    createdAt: currentDate,
    updatedAt: currentDate,
    golongan: " - ",
  },
  {
    id: "2",
    createdAt: currentDate,
    updatedAt: currentDate,
    golongan: " II c ",
  },
  {
    id: "3",
    createdAt: currentDate,
    updatedAt: currentDate,
    golongan: " II d ",
  },
  {
    id: "4",
    createdAt: currentDate,
    updatedAt: currentDate,
    golongan: " III a ",
  },
  {
    id: "5",
    createdAt: currentDate,
    updatedAt: currentDate,
    golongan: " III b ",
  },
  {
    id: "6",
    createdAt: currentDate,
    updatedAt: currentDate,
    golongan: " III c ",
  },
  {
    id: "7",
    createdAt: currentDate,
    updatedAt: currentDate,
    golongan: "III d",
  },
  {
    id: "8",
    createdAt: currentDate,
    updatedAt: currentDate,
    golongan: "IV a",
  },
  {
    id: "9",
    createdAt: currentDate,
    updatedAt: currentDate,
    golongan: " IV b ",
  },
  {
    id: "10",
    createdAt: currentDate,
    updatedAt: currentDate,
    golongan: "IV c",
  },
  {
    id: "11",
    createdAt: currentDate,
    updatedAt: currentDate,
    golongan: "V",
  },
  {
    id: "12",
    createdAt: currentDate,
    updatedAt: currentDate,
    golongan: "VI",
  },
  {
    id: "13",
    createdAt: currentDate,
    updatedAt: currentDate,
    golongan: "VII",
  },
  {
    id: "14",
    createdAt: currentDate,
    updatedAt: currentDate,
    golongan: "VIII",
  },
  {
    id: "15",
    createdAt: currentDate,
    updatedAt: currentDate,
    golongan: "IX",
  },
  {
    id: "16",
    createdAt: currentDate,
    updatedAt: currentDate,
    golongan: "X",
  },
  {
    id: "17",
    createdAt: currentDate,
    updatedAt: currentDate,
    golongan: "XI",
  },
  {
    id: "18",
    createdAt: currentDate,
    updatedAt: currentDate,
    golongan: "XII",
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("daftarGolongans", daftarGolongans, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("daftarGolongans", null, {});
  },
};
