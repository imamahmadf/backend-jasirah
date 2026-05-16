// const { Client, LocalAuth } = require("whatsapp-web.js");
// const qrcode = require("qrcode-terminal");

// const client = new Client({
//   authStrategy: new LocalAuth(),
//   puppeteer: { headless: true, args: ["--no-sandbox"] },
// });

// // client.on("qr", (qr) => {
// //   qrcode.generate(qr, { small: true });
// //   console.log("📲 Scan QR code untuk login WhatsApp");
// // });

// client.on("ready", () => {
//   console.log("✅ WhatsApp client siap!");
// });

// client.initialize();

// const sendMessage = async (phone, message) => {
//   try {
//     const chatId = phone + "@c.us";
//     await client.sendMessage(chatId, message);
//     console.log(`📤 Pesan terkirim ke ${phone}`);
//   } catch (err) {
//     console.error("❌ Gagal kirim pesan:", err.message);
//   }
// };

// module.exports = { sendMessage };
