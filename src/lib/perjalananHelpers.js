/**
 * Helper functions untuk perjalanan controllers
 */

/**
 * Mengkonversi bulan ke angka romawi
 * @param {Date} date - Objek tanggal
 * @returns {string} Bulan dalam format romawi (I-XII)
 */
const getRomanMonth = (date) => {
  const months = [
    "I",
    "II",
    "III",
    "IV",
    "V",
    "VI",
    "VII",
    "VIII",
    "IX",
    "X",
    "XI",
    "XII",
  ];
  return months[date.getMonth()];
};

/**
 * Mengkonversi angka ke terbilang (untuk angka 0-199)
 * @param {number} angka - Angka yang akan dikonversi
 * @returns {string} Terbilang dari angka
 */
function terbilang(angka) {
  const satuan = [
    "",
    "Satu",
    "Dua",
    "Tiga",
    "Empat",
    "Lima",
    "Enam",
    "Tujuh",
    "Delapan",
    "Sembilan",
    "Sepuluh",
    "Sebelas",
  ];

  if (angka < 12) {
    return satuan[angka];
  } else if (angka < 20) {
    return terbilang(angka - 10) + " Belas";
  } else if (angka < 100) {
    return (
      terbilang(Math.floor(angka / 10)) + " Puluh " + terbilang(angka % 10)
    );
  } else if (angka < 200) {
    return "Seratus " + terbilang(angka - 100);
  }
}

/**
 * Menghitung selisih hari antara dua tanggal (termasuk tanggal awal dan akhir)
 * @param {string|Date} startDate - Tanggal mulai
 * @param {string|Date} endDate - Tanggal akhir
 * @returns {number} Jumlah hari (termasuk tanggal awal dan akhir)
 */
const calculateDaysDifference = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const millisecondsPerDay = 24 * 60 * 60 * 1000; // hours * minutes * seconds * milliseconds
  const difference = Math.abs(end - start);
  return Math.round(difference / millisecondsPerDay) + 1; // Adding 1 to include both start and end dates
};

/**
 * Memformat tanggal ke format Indonesia (contoh: "01 Januari 2024")
 * @param {string|Date} tanggal - Tanggal yang akan diformat
 * @returns {string} Tanggal dalam format Indonesia
 */
const formatTanggal = (tanggal) => {
  return new Date(tanggal).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

/**
 * Memformat tanggal pengajuan ke format Indonesia
 * @param {string|Date} tanggalPengajuan - Tanggal pengajuan
 * @returns {string} Tanggal dalam format Indonesia
 */
const formatTanggalPengajuan = (tanggalPengajuan) => {
  return new Date(tanggalPengajuan).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

/**
 * Menghasilkan format jumlah hari dengan terbilang
 * @param {number} daysDifference - Selisih hari
 * @returns {string} Format "X (Terbilang) hari"
 */
const formatJumlahHari = (daysDifference) => {
  return `${daysDifference} (${terbilang(daysDifference)}) hari`;
};

module.exports = {
  getRomanMonth,
  terbilang,
  calculateDaysDifference,
  formatTanggal,
  formatTanggalPengajuan,
  formatJumlahHari,
};
