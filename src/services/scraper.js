const axios = require("axios");
const qs = require("qs");

async function scrapeData(params) {
  try {
    if (!params || !params.kt || !params.nomor || !params.seri) {
      const errorInfo = {
        type: "VALIDATION_ERROR",
        message: "Parameter tidak valid: kt, nomor, dan seri wajib diisi",
        received: params,
      };
      console.error("[scraper]", errorInfo);
      throw new Error(errorInfo.message);
    }

    // Normalisasi seri plat: kirim sesuai input form
    // Jika seri === "E", ubah menjadi "E-" karena website simpator minimal 2 karakter
    const rawSeri = String(params.seri || "")
      .toUpperCase()
      .trim();
    const adjustedSeri = rawSeri === "E" ? "E-" : rawSeri;

    const payload = {
      kt: String(params.kt || "KT")
        .toUpperCase()
        .trim(),
      nomor: String(params.nomor || "").trim(),
      seri: adjustedSeri,
      pkb: "Process",
    };

    // Helper untuk request dengan sesi (ambil cookie dulu, lalu POST)
    const requestWithSession = async (baseUrl) => {
      // 1) Ambil cookie sesi
      const getResp = await axios.get(`${baseUrl}/`, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
          "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
        },
        timeout: 15000,
        maxRedirects: 3,
        validateStatus: (s) => s >= 200 && s < 400,
      });
      const setCookie = getResp.headers?.["set-cookie"] || [];
      const cookieHeader = Array.isArray(setCookie)
        ? setCookie.map((c) => c.split(";")[0]).join("; ")
        : "";

      // 2) Kirim POST dengan cookie
      const postResp = await axios.post(
        `${baseUrl}/cari.php`,
        qs.stringify(payload),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            Accept:
              "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
            "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
            Referer: `${baseUrl}/`,
            Origin: baseUrl,
            ...(cookieHeader ? { Cookie: cookieHeader } : {}),
          },
          timeout: 15000,
          maxRedirects: 3,
          validateStatus: (s) => s >= 200 && s < 400,
        }
      );
      return postResp;
    };

    // Coba HTTP dulu, jika tidak cocok selector, coba HTTPS
    let response = await requestWithSession("http://simpator.kaltimprov.go.id");
    let html = response?.data;
    const looksLikeLanding =
      typeof html === "string" &&
      /<title>\s*SimPaTor\s*\|\s*Bapenda Kaltim/i.test(html) &&
      !/id=["']nopol["']/i.test(html);
    if (looksLikeLanding) {
      try {
        const httpsResp = await requestWithSession(
          "https://simpator.kaltimprov.go.id"
        );
        if (httpsResp?.data) {
          response = httpsResp;
          html = httpsResp.data;
        }
      } catch (e) {
        // biarkan lanjut dengan hasil http
      }
    }

    if (!html || typeof html !== "string") {
      const errorInfo = {
        type: "INVALID_RESPONSE",
        message: "Response tidak mengandung HTML yang valid",
        status: response?.status,
        headers: response?.headers,
        dataType: typeof html,
      };
      console.error("[scraper]", errorInfo);
      throw new Error(errorInfo.message);
    }

    const extractInputValue = (id) => {
      const regex = new RegExp(
        `<input[^>]+id=["']${id}["'][^>]+value=["']?([^"' >]+(?:\\s+[^"' >]+)*)["']?[^>]*>`,
        "i"
      );
      const match = html.match(regex);
      return match ? match[1].trim() : "";
    };

    // Diagnostik jika selector tidak ditemukan
    if (
      !/id=["']nopol["']/i.test(html) ||
      !/id=["']tg_pkb["']/i.test(html) ||
      !/id=["']tg_stnk["']/i.test(html)
    ) {
      console.error("[scraper][diagnostic] selector tidak cocok", {
        hasNopol: /id=["']nopol["']/i.test(html),
        hasTgPkb: /id=["']tg_pkb["']/i.test(html),
        hasTgStnk: /id=["']tg_stnk["']/i.test(html),
        hasTotal: /id=["']total["']/i.test(html),
        status: response?.status,
        first500: html.slice(0, 500),
      });
    }

    return {
      nopol: extractInputValue("nopol"),
      tg_pkb: extractInputValue("tg_pkb"),
      tg_stnk: extractInputValue("tg_stnk"),
      total: extractInputValue("total"),
    };
  } catch (err) {
    // Bentuk struktur error yang informatif dari Axios maupun error biasa
    const axiosError = err && err.isAxiosError ? err : null;
    const errorInfo = {
      type: axiosError ? "AXIOS_ERROR" : "UNEXPECTED_ERROR",
      message: err?.message || "Terjadi kesalahan tak terduga pada scraper",
      code: err?.code,
      stack: err?.stack,
      request: axiosError
        ? {
            method: err.config?.method,
            url: err.config?.url,
            timeout: err.config?.timeout,
            headers: err.config?.headers,
            data: err.config?.data,
          }
        : undefined,
      response: axiosError
        ? {
            status: err.response?.status,
            statusText: err.response?.statusText,
            headers: err.response?.headers,
            data:
              typeof err.response?.data === "string"
                ? err.response.data.slice(0, 2000) // batasi agar log tidak kebanyakan
                : err.response?.data,
          }
        : undefined,
    };

    console.error("[scraper]", errorInfo);
    // Lempar kembali error dengan konteks yang cukup agar bisa ditangani di layer atas
    throw new Error(
      `Scraper gagal: ${errorInfo.message}${
        errorInfo.response?.status ? ` (HTTP ${errorInfo.response.status})` : ""
      }`
    );
  }
}

module.exports = { scrapeData };
