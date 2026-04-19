export const jewelryProducts = [
  {
    id: 'fallback-celeste',
    name: 'Celeste Diamond Necklace',
    slug: 'celeste-diamond-necklace',
    category: 'Necklaces',
    price: 184000,
    featured: true,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCBgis_grR9CFNTeLnahUlajmU5bJSoP0Ji_yX3mynCMVB8evwWQIdrAO57CrtaJikCU4-iwq1iOuoRsceESJpk-TxfXI9fXHymXu0cvfa9phdCdSlkHpUlDgKSutg-lytU-xpN0pUNEZ8w2aDUsO0KubqXwh7NVfg3aHpMbQWPMD71h5_mxQ5dwPUVhgDyXWIxlrCzv9cCZ8INFsRWyuADl-PKJThtPE_98wWFj5nxtGMKgv7mwDIhLV_uLxwqs5h0_kuHbRN-lDBw',
  },
  {
    id: 'fallback-aurelia',
    name: 'Aurelia Solitaire Ring',
    slug: 'aurelia-solitaire-ring',
    category: 'Rings',
    price: 128000,
    featured: true,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCarHW4IbHd2x26SQ6mJSBGbhd_dH8akhr8Dn0wDlQgEEz7adD_-GET8U8fF6RO9zwD460ykb4k8TmYR55Xx1jJux4pckFZ8DRaPcnzDKvdhHJLuyrjOAJ32ygaV5S4lwQQonCX81NfTaiW7t04jNA1lvVw_lv3gqjrQ2mbQfTq9HAN8tQoOs_h826TFDE3Mnd5rTMN_jve5axuoQqkY7naN-cJv6wWbZEou6lVnPEY-TPvNdw8ULxznOJQUiVSs61xrneijm1DkGRa',
  },
  {
    id: 'fallback-nocturne',
    name: 'Nocturne Tennis Bracelet',
    slug: 'nocturne-tennis-bracelet',
    category: 'Bracelets',
    price: 94000,
    featured: true,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDj9LR_QCCjWP9JRJyVJG-kqWHPElw4FhMi7rz_wp4YWxDYZW-ReHdSTFZ2yqrqWaxQw2eqPyDCqXkx1vf85kvXDNObmEQJ9pt98nNMOn4W4_BuPi8DjHLQoketR1ks5D7K0XMUIHes7O34TfZyxWjaPkpS0MLD8QyG686HCtXyopnCmERr3PU94ram6-RL9cx8FjGc8X-dlXWu4f5XF5xHSFgELZbBJFrkh7eXq7D-SvqO-OAvVEbY91SL1ap1AewyTEe-555O6oxu',
  },
  {
    id: 'fallback-lumiere',
    name: 'Lumiere Sculpted Hoops',
    slug: 'lumiere-sculpted-hoops',
    category: 'Earrings',
    price: 36000,
    featured: true,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDWVHL6udB-YxWHYOVI_v5UnnjVjWmr952BR5psq9gmi7BKkPSga-auH-K1Re30UUSkFlf7KwxBRqqTCBpISqwTDM25Iu92UNziLHYrP14W3P-MQEwrJwxVkqYO0nWUDFcM4XKprP2bANHUyaT4WX8pEKlASWZIuKpsU2QXy7gLqsG1s2LlVqQQON35M5ohubpVDnr8Mv52m3QdQwLo6axjpgK6TpPnU_0fjrNngbWdhk9s_KcCCJIOZ-5FEHUv8E9zzs0B855Yy6nC',
  },
];

export const getFeaturedProducts = () => {
  return jewelryProducts.filter((product) => product.featured);
};

export const getProductsByCategory = (category) => {
  return jewelryProducts.filter((product) => product.category === category);
};

export const getProductById = (id) => {
  return jewelryProducts.find((product) => product.id === id);
};

export const getRandomProducts = (count = 4) => {
  const shuffled = [...jewelryProducts].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};
