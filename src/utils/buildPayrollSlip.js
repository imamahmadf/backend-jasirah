const STATUS_PEGAWAI_MINGGUAN = 5;

function normalizeList(data) {
  if (!data) return [];
  return Array.isArray(data) ? data : [data];
}

function getPayrollTunjangans(payrollRecord) {
  return normalizeList(
    payrollRecord?.payrollTunjangans ??
      payrollRecord?.payrollTunjangan ??
      payrollRecord?.PayrollTunjangans,
  );
}

function getPayrollPotongans(payrollRecord) {
  return normalizeList(
    payrollRecord?.payrollPotongans ??
      payrollRecord?.payrollPotongan ??
      payrollRecord?.PayrollPotongans,
  );
}

function resolveGajiPokokPayroll(payrollRecord, gajiPokokPegawai) {
  if (payrollRecord?.gajiPokok != null && payrollRecord.gajiPokok !== "") {
    return Number(payrollRecord.gajiPokok) || 0;
  }
  return Number(gajiPokokPegawai) || 0;
}

function mapPayrollTunjanganRows(items) {
  return normalizeList(items).map((item) => ({
    id: item.id,
    nama: item.nama || "-",
    nominal: Number(item.nominal) || 0,
  }));
}

function mapPayrollPotonganRows(items) {
  return normalizeList(items).map((item) => ({
    id: item.id,
    nama: item.nama || "-",
    nominal: Number(item.nominal) || 0,
  }));
}

function isTunjanganLembur(nama) {
  return /lembur/i.test(nama || "");
}

function splitTunjanganRows(tunjanganRows) {
  const gajiTetapRows = [];
  const gajiTidakTetapRows = [];

  tunjanganRows.forEach((row) => {
    if (isTunjanganLembur(row.nama)) {
      gajiTidakTetapRows.push(row);
    } else {
      gajiTetapRows.push(row);
    }
  });

  return { gajiTetapRows, gajiTidakTetapRows };
}

function buildPayrollSlip(payrollRecord, gajiPokokPegawai, namaPegawai) {
  const tunjanganRows = mapPayrollTunjanganRows(
    getPayrollTunjangans(payrollRecord),
  );
  const potonganRows = mapPayrollPotonganRows(getPayrollPotongans(payrollRecord));
  const { gajiTetapRows, gajiTidakTetapRows } = splitTunjanganRows(tunjanganRows);
  const gajiPokokNum = resolveGajiPokokPayroll(payrollRecord, gajiPokokPegawai);
  const totalGajiTetap =
    gajiPokokNum + gajiTetapRows.reduce((sum, row) => sum + row.nominal, 0);
  const totalGajiTidakTetap = gajiTidakTetapRows.reduce(
    (sum, row) => sum + row.nominal,
    0,
  );
  const totalGaji = totalGajiTetap + totalGajiTidakTetap;
  const totalPotongan = potonganRows.reduce((sum, row) => sum + row.nominal, 0);
  const gajiDiterima = totalGaji - totalPotongan;
  const takeHomePay = Math.floor(gajiDiterima / 100) * 100;

  return {
    nama: namaPegawai,
    periode: payrollRecord.periode,
    periodeAkhir: payrollRecord.periodeAkhir,
    gajiPokok: gajiPokokNum,
    tunjanganRows,
    gajiTetapRows,
    gajiTidakTetapRows,
    totalGajiTetap,
    totalGajiTidakTetap,
    totalGaji,
    potonganRows,
    totalPotongan,
    gajiDiterima,
    takeHomePay,
  };
}

function formatNominalDocx(value) {
  const num = Number(value) || 0;
  return num.toLocaleString("id-ID");
}

function formatLemburHarianForSlip(lemburHarianNominal) {
  if (lemburHarianNominal == null || lemburHarianNominal === "") {
    return "-";
  }

  const nominal = Number(lemburHarianNominal);
  if (!nominal || Number.isNaN(nominal)) {
    return "-";
  }

  return formatNominalDocx(nominal);
}

function resolveLemburHarianNominal(lemburHarian) {
  const nominal = Number(lemburHarian) || 0;
  return nominal > 0 ? nominal : 0;
}

function hitungGajiHarianPresensi(presensi, gajiPokokHarian) {
  let dayTotal = 0;

  if (presensi.statusPresensiId === 1) {
    dayTotal += Number(gajiPokokHarian) || 0;
  }

  dayTotal += resolveLemburHarianNominal(presensi.lemburHarian);
  return dayTotal;
}

function hitungTotalGajiPresensi(presensis, gajiPokokHarian) {
  return (presensis || []).reduce(
    (total, presensi) =>
      total + hitungGajiHarianPresensi(presensi, gajiPokokHarian),
    0,
  );
}

function hitungGajiPresensiPerUnitKerja(
  presensis,
  gajiPokokHarian,
  fallbackUnitKerjaId,
) {
  const totalsByUnit = {};

  for (const presensi of presensis || []) {
    const dayTotal = hitungGajiHarianPresensi(presensi, gajiPokokHarian);
    if (dayTotal <= 0) continue;

    const unitKerjaId =
      Number(presensi.unitKerjaId) || Number(fallbackUnitKerjaId);
    if (!unitKerjaId) continue;

    totalsByUnit[unitKerjaId] = (totalsByUnit[unitKerjaId] || 0) + dayTotal;
  }

  return totalsByUnit;
}

function formatPeriodeLabel(periode, periodeAkhir) {
  const formatSingle = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (!periode) return "-";
  if (periodeAkhir && periodeAkhir !== periode) {
    return `${formatSingle(periode)} s/d ${formatSingle(periodeAkhir)}`;
  }
  return formatSingle(periode);
}

function buildSlipBulananDocxPayload(slip, { jabatan, periodeLabel }) {
  const toRow = (uraian, nominal) => ({
    uraian,
    nominal: formatNominalDocx(nominal),
  });

  const gajiTetap = [
    toRow("Gaji Pokok", slip.gajiPokok),
    ...slip.gajiTetapRows.map((row) => toRow(row.nama, row.nominal)),
  ];
  const gajiTidakTetap = slip.gajiTidakTetapRows.map((row) =>
    toRow(row.nama, row.nominal),
  );
  const potongan = slip.potonganRows.map((row) => toRow(row.nama, row.nominal));

  return {
    filled: true,
    nama: slip.nama || "",
    jabatan: jabatan || "",
    periode: periodeLabel || formatPeriodeLabel(slip.periode, slip.periodeAkhir),
    gajiTetap,
    totalGajiTetap: formatNominalDocx(slip.totalGajiTetap),
    gajiTidakTetap,
    totalGajiTidakTetap: formatNominalDocx(slip.totalGajiTidakTetap),
    potongan,
    totalPotongan: formatNominalDocx(slip.totalPotongan),
    gajiDiterima: formatNominalDocx(slip.gajiDiterima),
    takeHomePay: formatNominalDocx(slip.takeHomePay),
  };
}

function createEmptySlipBulananPayload() {
  return {
    filled: false,
    nama: "",
    jabatan: "",
    periode: "",
    gajiTetap: [],
    totalGajiTetap: "",
    gajiTidakTetap: [],
    totalGajiTidakTetap: "",
    potongan: [],
    totalPotongan: "",
    gajiDiterima: "",
    takeHomePay: "",
  };
}

function isPegawaiMingguan(statusPegawaiId) {
  return Number(statusPegawaiId) === STATUS_PEGAWAI_MINGGUAN;
}

module.exports = {
  STATUS_PEGAWAI_MINGGUAN,
  buildPayrollSlip,
  buildSlipBulananDocxPayload,
  createEmptySlipBulananPayload,
  formatPeriodeLabel,
  formatLemburHarianForSlip,
  resolveLemburHarianNominal,
  hitungGajiHarianPresensi,
  hitungTotalGajiPresensi,
  hitungGajiPresensiPerUnitKerja,
  isPegawaiMingguan,
  isTunjanganLembur,
};
