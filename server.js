import express from "express";
import axios from "axios";

const app = express();
app.use(express.json());

const VERIFY_TOKEN = "unam_chicago_verify";
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

/* ===============================
   VERIFICACIÓN DEL WEBHOOK
=================================*/
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

/* ===============================
   WEBHOOK PRINCIPAL
=================================*/
app.post("/webhook", async (req, res) => {
  try {
    const message = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    if (!message) return res.sendStatus(200);

    const from = message.from;
    const cleanedNumber = from.replace(/^521/, "52");

    let userSelection = null;

    // Detectar tipo de mensaje
    if (message.type === "interactive") {
      userSelection = message.interactive.button_reply.id;
    } else if (message.type === "text") {
      userSelection = message.text.body.toLowerCase();
    }

    /* ===============================
       MENÚ PRINCIPAL
    =================================*/
    if (
      userSelection === "hola" ||
      userSelection === "menu" ||
      !userSelection ||
      userSelection === "volver"
    ) {
      await sendMainMenu(cleanedNumber);
      return res.sendStatus(200);
    }

    /* ===============================
       OPCIÓN INVIErNO
    =================================*/
    if (userSelection === "invierno") {
      await sendInviernoMenu(cleanedNumber);
      return res.sendStatus(200);
    }

    /* ===============================
       SUBMENÚ INVIErNO
    =================================*/
    if (userSelection === "costos_invierno") {
      await sendText(
        cleanedNumber,
        "💰 Los costos del programa Invierno PUMA 2026 están disponibles aquí:\nhttps://unamchicago.org/invierno"
      );
      return res.sendStatus(200);
    }

    if (userSelection === "fechas_invierno") {
      await sendText(
        cleanedNumber,
        "📅 Las fechas del programa Invierno PUMA 2026 están disponibles aquí:\nhttps://unamchicago.org/invierno"
      );
      return res.sendStatus(200);
    }

    if (userSelection === "requisitos_invierno") {
      await sendText(
        cleanedNumber,
        "📍 Requisitos del programa:\nSer estudiante activo UNAM.\nMás info aquí:\nhttps://unamchicago.org/invierno"
      );
      return res.sendStatus(200);
    }

    /* ===============================
       VISITAS
    =================================*/
    if (userSelection === "visitas") {
      await sendText(
        cleanedNumber,
        "🎓 Información Visitas Profesionales 2026:\nhttps://unamchicago.org/visitas"
      );
      return res.sendStatus(200);
    }

    /* ===============================
       DESCUENTO
    =================================*/
    if (userSelection === "descuento") {
      await sendText(
        cleanedNumber,
        "🎁 Descuento comunidad UNAM:\nEscribe a un asesor para aplicar el descuento."
      );
      return res.sendStatus(200);
    }

    // Si no reconoce mensaje
    await sendMainMenu(cleanedNumber);
    res.sendStatus(200);
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.sendStatus(500);
  }
});

/* ===============================
   FUNCIONES AUXILIARES
=================================*/

async function sendMainMenu(to) {
  await axios.post(
    `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
    {
      messaging_product: "whatsapp",
      to,
      type: "interactive",
      interactive: {
        type: "button",
        body: {
          text: "👋 Bienvenido a UNAM Chicago 🤓\n\nSelecciona una opción:"
        },
        action: {
         buttons: [
  {
    type: "reply",
    reply: {
      id: "invierno",
      title: "Invierno 2026"
    }
  },
  {
    type: "reply",
    reply: {
      id: "visitas",
      title: "Visitas 2026"
    }
  },
  {
    type: "reply",
    reply: {
      id: "descuento",
      title: "Descuento UNAM"
    }
  }
]
        }
      }
    },
    {
      headers: {
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
        "Content-Type": "application/json"
      }
    }
  );
}

async function sendInviernoMenu(to) {
  await axios.post(
    `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
    {
      messaging_product: "whatsapp",
      to,
      type: "interactive",
      interactive: {
        type: "button",
        body: {
          text: "❄️ Invierno PUMA 2026\n\n¿Qué deseas saber?"
        },
        action: {
          buttons: [
  {
    type: "reply",
    reply: {
      id: "costos_invierno",
      title: "Costos"
    }
  },
  {
    type: "reply",
    reply: {
      id: "fechas_invierno",
      title: "Fechas"
    }
  },
  {
    type: "reply",
    reply: {
      id: "requisitos_invierno",
      title: "Requisitos"
    }
  }
]
        }
      }
    },
    {
      headers: {
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
        "Content-Type": "application/json"
      }
    }
  );
}

async function sendText(to, message) {
  await axios.post(
    `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
    {
      messaging_product: "whatsapp",
      to,
      text: { body: message }
    },
    {
      headers: {
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
        "Content-Type": "application/json"
      }
    }
  );
}

app.listen(3000, () => console.log("Servidor iniciado en puerto 3000"));
