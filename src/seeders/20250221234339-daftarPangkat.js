const currentDate = new Date();
const daftarPangkats = [
  {
    id: 1,
    pangkat: "Juru Muda",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 2,
    pangkat: "Juru Muda Tingkat I",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 3,
    pangkat: "Juru",
    createdAt: currentDate,
    updatedAt: currentDate,
  },

  {
    id: 4,
    pangkat: "Juru Tingkat I",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 5,
    pangkat: "Pengatur Muda",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 6,
    pangkat: "Pengatur Muda Tingkat I",
    createdAt: currentDate,
    updatedAt: currentDate,
  },

  {
    id: 7,
    pangkat: "Pengatur",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 8,
    pangkat: "Pengatur Tingkat I",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 9,
    pangkat: "Penata Muda",
    createdAt: currentDate,
    updatedAt: currentDate,
  },

  {
    id: 10,
    pangkat: "Penata Muda Tingkat I",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 11,
    pangkat: "Penata",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 12,
    pangkat: "Penata Tingkat I",
    createdAt: currentDate,
    updatedAt: currentDate,
  },

  {
    id: 13,
    pangkat: "Pembina",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 14,
    pangkat: "Pembina Tingkat I",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 15,
    pangkat: "Pembina Utama Muda",
    createdAt: currentDate,
    updatedAt: currentDate,
  },

  {
    id: 16,
    pangkat: "Pembina Utama Madya",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 17,
    pangkat: "Pembina Utama",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
  {
    id: 18,
    pangkat: "-",
    createdAt: currentDate,
    updatedAt: currentDate,
  },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("daftarPangkats", daftarPangkats, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("daftarPangkats", null, {});
  },
};
