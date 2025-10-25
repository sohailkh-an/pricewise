import axios from "axios";
import * as cheerio from "cheerio";

export async function getVegaspkPrice(url) {
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
    const priceText = $("div.product-price span.current-price")
      .first()
      .text()
      .trim();
    const priceValue = Number(priceText.replace(/[^0-9]/g, ""));

    return {
      platform: "Vegas.pk",
      originalPrice: "N/A",
      price: priceValue,
      formatted: priceText,
      url,
    };
  } catch (err) {
    console.error(
      "Error scraping Vegas.pk:",
      err.response?.status,
      err.message
    );
    return null;
  }
}

(async () => {
  const result = await getVegaspkPrice(
    "https://www.vegas.pk/pd/maybelline-new-york-pakistan/maybelline-new-york-fit-me-matte-poreless-liquid-foundation-18ml"
  );
  console.log(result);
})();

{
  /* <span
  class="woocommerce-Price-amount amount eez-nosnippet"
  data-nosnippet="true"
>
  <bdi>
    <span class="woocommerce-Price-currencySymbol">Rs</span>&nbsp;22,490
  </bdi>
</span>; */
}
