import axios from "axios";
import * as cheerio from "cheerio";

export async function getPinexportPrice(url) {
  try {
    const headers = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
      "Accept-Language": "en-US,en;q=0.9",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      "Accept-Encoding": "gzip, deflate, br",
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
      Connection: "keep-alive",
      "Upgrade-Insecure-Requests": "1",
      Referer: "https://www.google.com/",
    };

    const { data } = await axios.get(url, {
      headers,
      timeout: 10000,
    });

    const $ = cheerio.load(data);
    const priceText = $("span.price").first().text().trim();

    return {
      platform: "pinexport",
      originalPrice: "N/A",
      price: Number(priceText),
      formatted: priceText,
      url,
    };
  } catch (err) {
    console.error(
      "Error scraping pinexport:",
      err.response?.status,
      err.message
    );
    return null;
  }
}

// (async () => {
//   const result = await getPinexportPrice(
//     "https://pinexport.vercel.app/products/cmdd5katk0001p4gomh0wanyt"
//   );
//   console.log(result);
// })();
