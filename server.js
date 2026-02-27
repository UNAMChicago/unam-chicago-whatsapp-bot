import express from "express";
import axios from "axios";

const app = express();
app.use(express.json());

const VERIFY_TOKEN = "unam_chicago_verify";
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  } else {
    return res.sendStatus(403);
  }
});

app.post("/webhook", async (req, res) => {
  const body = req.body;

  try {
    const message = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    if (!message) return res.sendStatus(200);

    const from = message.from;
    const text = message.text?.body;

    let responseText = "";

    switch (text) {
      case "1":
        responseText = "❄️ Información Invierno PUMA 2026:\nhttps://unamchicago.org/invierno";
        break;
      case "2":
        responseText = "🎓 Información Visitas Profesionales 2026:\nhttps://unamchicago.org/visitas";
        break;
      case "3":
        responseText = "🏫 Descuento comunidad UNAM:\nEscribe a asesor para aplicar descuento.";
        break;
      case "0":
        responseText = "👋 Gracias por contactarnos.";
        break;
      default:
        responseText =
          "Bienvenido al ChatBot UNAM Chicago 🤓\n\n" +
          "1️⃣ Invierno PUMA 2026\n" +
          "2️⃣ Visitas Profesionales 2026\n" +
          "3️⃣ Descuento comunidad UNAM\n" +
          "0️⃣ Finalizar";
    }

    await axios.post(
      `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to: from,
        text: { body: responseText },
      },
      {
        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

app.listen(3000, () => console.log("Servidor iniciado en puerto 3000"));
