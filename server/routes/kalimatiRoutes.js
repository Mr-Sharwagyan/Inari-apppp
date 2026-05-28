import express from "express";
import axios from "axios";
import { createRequire } from "module";

const router = express.Router();
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

export const fetchFromPDF = async () => {
  const url = "https://kalimatimarket.gov.np/files/price.pdf";

  const res = await axios.get(url, { responseType: "arraybuffer" });
  const data = await pdfParse(res.data);

  const text = data.text;

  // then regex parsing
  return parsePrices(text);
};

// Example route (IMPORTANT)
router.get("/prices", async (req, res) => {
  try {
    const data = await fetchFromPDF();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;