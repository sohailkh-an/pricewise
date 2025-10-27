import axios from "axios";
import * as cheerio from "cheerio";

export async function getMedogetPrice(url) {
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

    let priceText = $("div.price-list span.price--highlight").text().trim();
    let onSale = true;

    if (!priceText) {
      priceText = $("div.price-list span.price--compare").text().trim();
      onSale = false;
    }

    if (!priceText) {
      priceText = $("div.price-list span.price").first().text().trim();
      onSale = false;
    }

    const priceMatch = priceText.match(/Rs\.[\d,]+\.?\d*/);
    const cleanPriceText = priceMatch ? priceMatch[0] : priceText;

    const priceValue = cleanPriceText
      ? Math.floor(parseFloat(cleanPriceText.replace(/Rs\.|,/g, "")))
      : 0;

    return {
      platform: "medoget.com",
      price: priceValue,
      formatted: cleanPriceText,
      onSale,
      url,
    };
  } catch (err) {
    console.error(
      "Error scraping medoget.com:",
      err.response?.status,
      err.message
    );
    return null;
  }
}

// (async () => {
//   const result = await getMedogetPrice(
//     "https://www.medoget.com/products/cerave-hydrating-facial-cleanser"
//   );
//   console.log(result);
// })();
