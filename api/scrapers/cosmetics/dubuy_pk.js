import axios from "axios";
import * as cheerio from "cheerio";

export async function getDubuypkPrice(url) {
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

    const extractPrice = () => {
      const contentPrice = $("#ProductPrice-product-template").attr("content");
      if (contentPrice) {
        return {
          value: Math.floor(parseFloat(contentPrice)),
          text: $("#ProductPrice-product-template").text().trim(),
        };
      }

      const priceText = $("#ProductPrice-product-template").text().trim();
      if (priceText) {
        return {
          value: parseInt(priceText.replace(/[^0-9]/g, "")),
          text: priceText,
        };
      }

      return { value: 0, text: "N/A" };
    };

    const { value: priceValue, text: priceText } = extractPrice();

    return {
      platform: "dubuypk.com",
      price: priceValue,
      formatted: priceText,
      url,
    };
  } catch (err) {
    console.error(
      "Error scraping dubuypk.com:",
      err.response?.status,
      err.message
    );
    return null;
  }
}

// (async () => {
//   const result = await getDubuypkPrice(
//     "https://dubuypk.com/products/od-glycolic-acid-7-toning-solution-240ml"
//   );
//   console.log(result);
// })();
