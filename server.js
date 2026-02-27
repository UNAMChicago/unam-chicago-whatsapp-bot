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

    if (message.type === "interactive") {
      userSelection = message.interactive.button_reply.id;
    } else if (message.type === "text") {
      userSelection = message.text.body.toLowerCase().trim();
    }

    console.log("Usuario seleccionó:", userSelection);

    /* ===============================
       MENÚ PRINCIPAL SOLO SI DICE HOLA
    =================================*/
    if (userSelection === "hola" || userSelection === "menu") {
      await sendMainMenu(cleanedNumber);
      return res.sendStatus(200);
    }

    /* ===============================
       INVIErNO
    =================================*/
    if (userSelection === "invierno") {
      await sendInviernoMenu(cleanedNumber);
      return res.sendStatus(200);
    }

    if (userSelection === "costos_invierno") {
      await sendText(cleanedNumber, "💰 Info de costos aquí:\nhttps://unamchicago.org/invierno");
      return res.sendStatus(200);
    }

    if (userSelection === "fechas_invierno") {
      await sendText(cleanedNumber, "📅 Fechas disponibles aquí:\nhttps://unamchicago.org/invierno");
      return res.sendStatus(200);
    }

    if (userSelection === "requisitos_invierno") {
      await sendText(cleanedNumber, "📍 Requisitos aquí:\nhttps://unamchicago.org/invierno");
      return res.sendStatus(200);
    }

    /* ===============================
       VISITAS
    =================================*/
    if (userSelection === "visitas") {
      await sendText(cleanedNumber, "🎓 Info visitas:\nhttps://unamchicago.org/visitas");
      return res.sendStatus(200);
    }

    /* ===============================
       DESCUENTO
    =================================*/
    if (userSelection === "descuento") {
      await sendText(cleanedNumber, "🎁 Info descuento UNAM disponible con asesor.");
      return res.sendStatus(200);
    }

    // Si escribe algo random
    await sendText(cleanedNumber, "Escribe 'hola' para ver el menú.");
    return res.sendStatus(200);

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
