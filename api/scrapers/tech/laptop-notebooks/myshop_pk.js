import axios from "axios";
import * as cheerio from "cheerio";

export async function getMyshoppkPrice(url) {
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

    let number = 154500.0;
    console.log("To integer:", number);

    const $ = cheerio.load(data);
    const priceText = $("span.price-container span.price-wrapper span.price")
      .first()
      .text()
      .trim();

    const priceValue = Math.floor(
      parseFloat(priceText.replace(/Rs|,/g, "").trim())
    );

    return {
      platform: "myshop.pk",
      price: priceValue,
      formatted: priceText,
      url,
    };
  } catch (err) {
    console.error(
      "Error scraping myshop.pk:",
      err.response?.status,
      err.message
    );
    return null;
  }
}

// (async () => {
//   const result = await getMyshoppkPrice(
//     "https://myshop.pk/dell-vostro-15-3530-pakistan.html"
//   );
//   console.log(result);
// })();
