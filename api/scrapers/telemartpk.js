import axios from "axios";

export async function getTelemartPrice(url) {
  try {
    const slug = url.split("/").pop();
    const apiUrl = `https://telemart.pk/api/product/${slug}`;

    const { data } = await axios.get(apiUrl, {
      timeout: 10000,
    });

    const product = data.product;
    const price = product.discounted_price || product.price;

    return {
      platform: "telemart.pk",
      price: price,
      originalPrice: product.price,
      discountedPrice: product.discounted_price,
      url,
    };
  } catch (err) {
    console.error(
      "Error scraping telemart.pk:",
      err.response?.status,
      err.message
    );
    return null;
  }
}

// (async () => {
//   const result = await getTelemartPrice(
//     "https://telemart.pk/haier-h32s80efx-32-inch-qled-google-tv-with-official-warranty"
//   );
//   console.log(result);
// })();
