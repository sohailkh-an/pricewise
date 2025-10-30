import {
  getPriceoyepkPrice,
  getEezepcComPrice,
  getXcessorieshubPrice,
  getCellmartpkPrice,
  getShophiveComPrice,
  getGalaxypkPrice,
  getLaptophousepkPrice,
  getMyshoppkPrice,
  getTechglobepkPrice,
  getTechtreasurepkPrice,
  getChasevaluePrice,
  getJust4girlspkPrice,
  getMakeupstashpkPrice,
  getNaheedPrice,
  getTrendifypkPrice,
  getVegaspkPrice,
  getMakeupcityshopPrice,
  getDubuypkPrice,
  getDermapkPrice,
  getMedogetPrice,
  getHighfypkPrice,
  getReanapkPrice,
  getAysonlinePrice,
  getFriendsHomePrice,
  getJalalelectronicsPrice,
  getJapanelectronicsPrice,
  getLahorecentrePrice,
  getSohailelectronicsPrice,
  getShadenterprisespkPrice,
  getMegapkPrice,
} from "../routes/products.js";

export const scrapeProductPrice = async (product) => {
  try {
    console.log(`Scraping prices for: ${product.title}`);

    const urlArray = [
      product.priceComparison.platformOneUrl,
      product.priceComparison.platformTwoUrl,
      product.priceComparison.platformThreeUrl,
      product.priceComparison.platformFourUrl,
      product.priceComparison.platformFiveUrl,
      product.priceComparison.platformSixUrl,
      product.priceComparison.platformSevenUrl,
      product.priceComparison.platformEightUrl,
      product.priceComparison.platformNineUrl,
      product.priceComparison.platformTenUrl,
    ].filter(Boolean);

    const pricePromises = [];
    const category = product.category.toLowerCase();

    for (const url of urlArray) {
      try {
        const scraperFunction = getPlatformScraper(url, category);
        if (scraperFunction) {
          pricePromises.push(scraperFunction(url));
        }
      } catch (error) {
        console.error(`Error processing URL ${url}:`, error.message);
      }
    }

    const results = await Promise.allSettled(pricePromises);
    const validResults = results
      .filter((result) => result.status === "fulfilled" && result.value)
      .map((result) => result.value);

    if (validResults.length === 0) {
      console.warn(`No valid prices found for: ${product.title}`);
      return {
        success: false,
        lowestPrice: null,
        prices: [],
      };
    }

    validResults.sort((a, b) => a.price - b.price);

    console.log(
      `Found ${validResults.length} prices. Lowest: Rs.${validResults[0].price}`
    );

    return {
      success: true,
      lowestPrice: validResults[0].price,
      lowestPriceUrl: validResults[0].url,
      lowestPricePlatform: validResults[0].platform,
      prices: validResults,
    };
  } catch (error) {
    console.error("Scrape product price error:", error);
    return {
      success: false,
      lowestPrice: null,
      prices: [],
      error: error.message,
    };
  }
};

const getPlatformScraper = (url, category) => {
  if (category === "tech") {
    if (url.includes("priceoye")) return getPriceoyepkPrice;
    if (url.includes("eezepc")) return getEezepcComPrice;
    if (url.includes("xcessorieshub")) return getXcessorieshubPrice;
    if (url.includes("cellmart.pk")) return getCellmartpkPrice;
    if (url.includes("shophive")) return getShophiveComPrice;
    if (url.includes("galaxy.pk")) return getGalaxypkPrice;
    if (url.includes("laptophouse.pk")) return getLaptophousepkPrice;
    if (url.includes("myshop.pk")) return getMyshoppkPrice;
    if (url.includes("techglobe.pk")) return getTechglobepkPrice;
    if (url.includes("techtreasure.pk")) return getTechtreasurepkPrice;
  } else if (category === "cosmetics") {
    if (url.includes("chasevalue")) return getChasevaluePrice;
    if (url.includes("just4girls")) return getJust4girlspkPrice;
    if (url.includes("makeupstash")) return getMakeupstashpkPrice;
    if (url.includes("naheed.pk")) return getNaheedPrice;
    if (url.includes("trendify.pk")) return getTrendifypkPrice;
    if (url.includes("vegas.pk")) return getVegaspkPrice;
    if (url.includes("makeupcityshop")) return getMakeupcityshopPrice;
    if (url.includes("dubuypk.com")) return getDubuypkPrice;
    if (url.includes("derma.pk")) return getDermapkPrice;
    if (url.includes("medoget.com")) return getMedogetPrice;
    if (url.includes("highfy.pk")) return getHighfypkPrice;
    if (url.includes("reana.pk")) return getReanapkPrice;
  } else if (category === "home appliances") {
    if (url.includes("aysonline")) return getAysonlinePrice;
    if (url.includes("friendshome")) return getFriendsHomePrice;
    if (url.includes("jalalelectronics")) return getJalalelectronicsPrice;
    if (url.includes("japanelectronics")) return getJapanelectronicsPrice;
    if (url.includes("lahorecentre")) return getLahorecentrePrice;
    if (url.includes("sohailelectronics")) return getSohailelectronicsPrice;
    if (url.includes("shadenterprises")) return getShadenterprisespkPrice;
    if (url.includes("mega.pk")) return getMegapkPrice;
  }

  return null;
};
