import axios from "axios";
import * as cheerio from "cheerio";

export async function getPriceoyepkPrice(url) {
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
    const priceText = $("span.summary-price.text-black.price-size-lg.bold span")
      .first()
      .text()
      .trim();
    const priceValue = Math.floor(
      parseFloat(priceText.replace(/Rs|,|\s/g, "").trim())
    );

    return {
      platform: "priceoye.pk",
      originalPrice: "N/A",
      price: priceValue,
      formatted: priceText,
      url,
    };
  } catch (err) {
    console.error(
      "Error scraping priceoye.pk:",
      err.response?.status,
      err.message
    );
    return null;
  }
}

// (async () => {
//   const result = await getPriceoyepkPrice(
//     "https://priceoye.pk/laptops/hp/hp-probook-450-g10-core-i5-13th-gen-1335u"
//   );
//   console.log(result);
// })();

{
  /* <span class="summary-price text-black price-size-lg bold">
  <span>
    <sup>Rs</sup>
    21,500
  </span>
</span>; */
}
