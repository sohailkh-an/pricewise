const PlatformLogos = [
  {
    platform: "priceoye",
    logo: "https://static.priceoye.pk/images/logo.svg",
  },
  {
    platform: "sohailelectronics",
    logo: "https://sohailelectronics.com/wp-content/uploads/2024/10/Sohail-Electronics-logo.png",
  },
  {
    platform: "jalalelectronics",
    logo: "https://jalalelectronics.com/wp-content/uploads/2020/06/Jalal-Electronics-Logo-PNG.png",
  },
  {
    platform: "aysonline",
    logo: "https://www.aysonline.pk/wp-content/uploads/2022/06/ays-logo-since-1956-sticky.jpg",
  },
  {
    platform: "japanelectronics",
    logo: "https://japanelectronics.com.pk/cdn/shop/files/logo_350x70-01_350x.png?v=1734778113",
  },
  {
    platform: "lahorecentre",
    logo: "https://www.lahorecentre.com/wp-content/uploads/2023/04/logo.png",
  },
  {
    platform: "friendshome",
    logo: "https://friendshome.pk/cdn/shop/files/Logo-Friends-Home-1.jpg?v=1759093560&width=200",
  },
  {
    platform: "chasevalue",
    logo: "https://chasevalue.pk/cdn/shop/files/logo_chase.png?v=1708497481&width=300",
  },
  {
    platform: "naheed.pk",
    logo: "https://media.naheed.pk/logo/stores/1/websitelogo_comp.png",
  },
  {
    platform: "makeupstash",
    logo: "https://makeupstash.pk/cdn/shop/files/main-logo-sticky-header-retina_2bdb185f-dbd8-49be-9461-42ccf930890d.png?v=1688754512&width=300",
  },
  {
    platform: "trendify",
    logo: "https://trendify.pk/cdn/shop/files/Trendify_logo.webp?v=1660292127",
  },
  {
    platform: "just4girls",
    logo: "https://just4girls.pk/wp-content/uploads/2023/07/J4G-logo.svg",
  },
  {
    platform: "shophive",
    logo: "/shophiveLogo.png",
  },
  {
    platform: "eezepc",
    logo: "https://eezepc.com/wp-content/uploads/2024/03/eezepc-logo.svg",
  },
  {
    platform: "vegas.pk",
    logo: "https://www.vegas.pk/imgs/theme/logo-2%20(2).png",
  },
  {
    platform: "makeupcity",
    logo: "https://www.makeupcityshop.com/cdn/shop/files/makeupcity-logo.png?v=1745920175",
  },
  {
    platform: "dubuypk",
    logo: "https://dubuypk.com/cdn/shop/files/cccc_300x.png?v=1623941629",
  },
  {
    platform: "derma.pk",
    logo: "https://derma.pk/cdn/shop/files/Derma.pk-logo-scaled-1536x409-1.webp?v=1747151944&width=180",
  },
  {
    platform: "medoget.com",
    logo: "https://www.medoget.com/cdn/shop/files/Medoget_logo_140x@2x.png?v=1667904358",
  },
  {
    platform: "highfy.pk",
    logo: "https://highfy.pk/cdn/shop/files/HIGHFY_NEW_LOGO.png?v=1751873469&width=90",
  },
  {
    platform: "shadenterprises",
    logo: "/shadenterprises.png",
  },
  {
    platform: "xcessorieshub",
    logo: "https://xcessorieshub.com/wp-content/uploads/2023/08/xcessorieshub_logo.webp",
  },
  {
    platform: "galaxy.pk",
    logo: "https://www.galaxy.pk/images/logo/galaxy.pk-logo-78721041124105542.png",
  },
  {
    platform: "myshop.pk",
    logo: "https://myshop.pk/pub/media/logo/stores/1/logomyshop.png",
  },
  {
    platform: "techglobe.pk",
    logo: "https://www.techglobe.pk/images/logo/techglobe.pk-logo-4012110519053601.png",
  },
  {
    platform: "techtreasure.pk",
    logo: "https://static.webx.pk/files/17888/Images/tech-02-(1)-17888-220725115308.png",
  },
  {
    platform: "laptophouse.pk",
    logo: "https://laptophouse.pk/wp-content/uploads/2025/08/Untitled-1.png",
  },
  {
    platform: "cellmart.pk",
    logo: "https://cellmart.pk/wp-content/uploads/2024/07/logo-2.png",
  },
  {
    platform: "reana.pk",
    logo: "https://reana.pk/cdn/shop/files/Reana_Logo_HD.png?v=1757403760&width=170",
  },
  {
    platform: "mega.pk",
    logo: "data:image/png;base64,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",
  },
];

export default PlatformLogos;
