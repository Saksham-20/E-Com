const seedCategories = [
  {
    name: 'Rings',
    slug: 'rings',
    description: 'Statement solitaires, cocktail silhouettes, and heirloom-ready bands.',
    sortOrder: 1,
  },
  {
    name: 'Necklaces',
    slug: 'necklaces',
    description: 'Layered chains, diamond rivieres, and sculptural pendants for evening and occasion wear.',
    sortOrder: 2,
  },
  {
    name: 'Earrings',
    slug: 'earrings',
    description: 'Polished hoops, chandelier drops, and gemstone accents with refined sparkle.',
    sortOrder: 3,
  },
  {
    name: 'Bracelets',
    slug: 'bracelets',
    description: 'Tennis lines, cuffs, and delicate chain bracelets with a couture finish.',
    sortOrder: 4,
  },
  {
    name: 'Watches',
    slug: 'watches',
    description: 'Jewelry-inspired timepieces crafted as collectible wardrobe signatures.',
    sortOrder: 5,
  },
];

const seedProducts = [
  {
    name: 'Celeste Diamond Necklace',
    slug: 'celeste-diamond-necklace',
    categorySlug: 'necklaces',
    description:
      'A graduated diamond riviere designed to sit close to the collarbone, balancing gala-level brilliance with an easy drape for modern evening dressing.',
    shortDescription: 'Graduated diamond necklace with an architectural evening profile.',
    price: 184000,
    comparePrice: 210000,
    sku: 'EC-NKL-001',
    stockQuantity: 6,
    lowStockThreshold: 2,
    isFeatured: true,
    isBestseller: true,
    isNewArrival: false,
    weight: 48.5,
    dimensions: '16 in adjustable length',
    metaTitle: 'Celeste Diamond Necklace | ECOM',
    metaDescription: 'Graduated diamond necklace crafted for black-tie moments and elevated occasion dressing.',
    attributes: {
      metal: '18k white gold',
      gemstone: 'Natural diamond',
      collection: 'Evening Icons',
      closure: 'Box clasp',
    },
    images: [
      {
        imageUrl:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuCBgis_grR9CFNTeLnahUlajmU5bJSoP0Ji_yX3mynCMVB8evwWQIdrAO57CrtaJikCU4-iwq1iOuoRsceESJpk-TxfXI9fXHymXu0cvfa9phdCdSlkHpUlDgKSutg-lytU-xpN0pUNEZ8w2aDUsO0KubqXwh7NVfg3aHpMbQWPMD71h5_mxQ5dwPUVhgDyXWIxlrCzv9cCZ8INFsRWyuADl-PKJThtPE_98wWFj5nxtGMKgv7mwDIhLV_uLxwqs5h0_kuHbRN-lDBw',
        altText: 'Celeste Diamond Necklace on an ivory stand',
      },
      {
        imageUrl:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuCALuiVy5WuNEU_HiIayBWaoCAnJfMC6ZW-fg69qvnxYLKoiq4Vqc0E6s6wxww9627yvSzU06B-QkGIQDHUexSg3FZ_K-G-znCyri2vXRT_PTaOjmx3FVZEeF15GyRMlaTrU0_8EottCJ2acG1cEgRP36YHA0chlq1Bzayl0pxbLPnoyuIc2J_Az0030NWL_8FD6oRXnTmq3dYyispGE36bouvsDNNI77DMF-03ktOyhuhCOBZTTsBQbC7So6LrAux4ce_9EMkJVhxN',
        altText: 'Close-up of Celeste Diamond Necklace pendant detail',
      },
    ],
  },
  {
    name: 'Aurelia Solitaire Ring',
    slug: 'aurelia-solitaire-ring',
    categorySlug: 'rings',
    description:
      'An elevated solitaire ring with a high-set center stone and knife-edge band, created for engagements, anniversaries, and milestone gifting.',
    shortDescription: 'Classic solitaire ring with a sharp knife-edge profile.',
    price: 128000,
    comparePrice: 146000,
    sku: 'EC-RNG-001',
    stockQuantity: 9,
    lowStockThreshold: 3,
    isFeatured: true,
    isBestseller: true,
    isNewArrival: false,
    weight: 5.6,
    dimensions: 'Size 6 standard, resizable',
    metaTitle: 'Aurelia Solitaire Ring | ECOM',
    metaDescription: 'A polished solitaire ring crafted in platinum for modern engagement and occasion wear.',
    attributes: {
      metal: 'Platinum',
      gemstone: 'Brilliant-cut diamond',
      setting: 'Four-prong',
      collection: 'Signature Solitaires',
    },
    images: [
      {
        imageUrl:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuCarHW4IbHd2x26SQ6mJSBGbhd_dH8akhr8Dn0wDlQgEEz7adD_-GET8U8fF6RO9zwD460ykb4k8TmYR55Xx1jJux4pckFZ8DRaPcnzDKvdhHJLuyrjOAJ32ygaV5S4lwQQonCX81NfTaiW7t04jNA1lvVw_lv3gqjrQ2mbQfTq9HAN8tQoOs_h826TFDE3Mnd5rTMN_jve5axuoQqkY7naN-cJv6wWbZEou6lVnPEY-TPvNdw8ULxznOJQUiVSs61xrneijm1DkGRa',
        altText: 'Aurelia Solitaire Ring hero image',
      },
      {
        imageUrl:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuB5-HkRAZV2i_PtwHXplRkngrMDfQZpHmJr6DXRFuSLasJWgr_vCVmpz95YMdxUVCdk7xWzFD8tKYz-WhQz11EMiBSvtGEE6sxsCXdZiN5FGbmjecEEm-nIBq7XwjoXad6X7hrKptM2MTltdi5fofRKBhzH46KnEP3po06Jye1LXDGTy-FFP-DVNFH4KJNya2j2hxeF58rt4lUeAR0lWy3NIpoKFY8wNOMv2UgiosssggoXZmNOEhPX3T7BsTf7f4Cgb_PyQ4skewPZ',
        altText: 'Aurelia Solitaire Ring side detail',
      },
    ],
  },
  {
    name: 'Verde Cascade Earrings',
    slug: 'verde-cascade-earrings',
    categorySlug: 'earrings',
    description:
      'Long-line drop earrings with emerald stones and diamond accents, designed to frame the face with movement and softened glamour.',
    shortDescription: 'Emerald drop earrings with fluid chandelier movement.',
    price: 76000,
    comparePrice: 91000,
    sku: 'EC-EAR-001',
    stockQuantity: 11,
    lowStockThreshold: 3,
    isFeatured: false,
    isBestseller: true,
    isNewArrival: false,
    weight: 14.8,
    dimensions: '2.8 in drop length',
    metaTitle: 'Verde Cascade Earrings | ECOM',
    metaDescription: 'Emerald and diamond drop earrings for black-tie styling and festive dressing.',
    attributes: {
      metal: '18k yellow gold',
      gemstone: 'Emerald and diamond',
      backing: 'Lever back',
      collection: 'Evening Icons',
    },
    images: [
      {
        imageUrl:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuBYpuZJm83YvCtuxDmE08kEVnTh1ZsZjWtb2C11KOlLxaAJTdZay0r-0jfJZoJaRmy9870VxXr4jMROmfObcXyCJZFBGdEtYGkjyJtsf8f_d-pSN-2eiRaR5PrRUvi7DgoeYyKA0lesBZlgu2u2Zhe5USJNaO1A-7xj1gee7gAg5Iorg9M5uSNlgkfRLK9lnxYhS7GBK1s4A1LxFAj5mSNojMvk4U6eIyflyU9vAQZLwbtGRqeHXLS_xYwMq0Ehx-sKrx3GG4AdCeuc',
        altText: 'Verde Cascade Earrings displayed against a neutral backdrop',
      },
      {
        imageUrl:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuCn288K0-fUiPOnmTNfkEwh58F21lvkubEtEd8S_TJxBmIbjKseVlTyC7ayzOvV4GFHK2-44oK05VQqx1jr49fW1Y-pjU7zZdBIwcP0QFV8BeImjTgvJoZ1J_3S-fH7tcLp_QTiVftehxoQtuR3KXrNwVgFnNi3gA5w9zVElOau2FlYx0HKsGyF4nSFp2Z8sfJH8xVh4wnXqWC45jdgGsMOfR4BrQHSRDtqm3H9vGDWCqup39dI2iTf7LyBXoxk7CSPovNP9jDJnJp2',
        altText: 'Close-up of Verde Cascade Earrings diamond detail',
      },
    ],
  },
  {
    name: 'Nocturne Tennis Bracelet',
    slug: 'nocturne-tennis-bracelet',
    categorySlug: 'bracelets',
    description:
      'A flexible tennis bracelet with matched stones and low-profile settings, shaped to stack seamlessly or carry an entire evening look on its own.',
    shortDescription: 'Refined tennis bracelet built for stacking and gala styling.',
    price: 94000,
    comparePrice: 109000,
    sku: 'EC-BRC-001',
    stockQuantity: 8,
    lowStockThreshold: 2,
    isFeatured: true,
    isBestseller: false,
    isNewArrival: true,
    weight: 18.9,
    dimensions: '7 in length',
    metaTitle: 'Nocturne Tennis Bracelet | ECOM',
    metaDescription: 'Diamond tennis bracelet with a low-set profile and elevated evening polish.',
    attributes: {
      metal: '18k white gold',
      gemstone: 'Round diamond',
      closure: 'Safety clasp',
      collection: 'After Dark',
    },
    images: [
      {
        imageUrl:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuDj9LR_QCCjWP9JRJyVJG-kqWHPElw4FhMi7rz_wp4YWxDYZW-ReHdSTFZ2yqrqWaxQw2eqPyDCqXkx1vf85kvXDNObmEQJ9pt98nNMOn4W4_BuPi8DjHLQoketR1ks5D7K0XMUIHes7O34TfZyxWjaPkpS0MLD8QyG686HCtXyopnCmERr3PU94ram6-RL9cx8FjGc8X-dlXWu4f5XF5xHSFgELZbBJFrkh7eXq7D-SvqO-OAvVEbY91SL1ap1AewyTEe-555O6oxu',
        altText: 'Nocturne Tennis Bracelet draped over charcoal stone',
      },
      {
        imageUrl:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuBIJoqb60oM1jYGufcGVUZX9OgYIvQiaTgBMy8yLfEpxwI89zTmiY4jMX9ItjoDnH6dwgA0CD2GXeWYxnXEZ2DdsulapRYAfKI8SzY3NiRk2K7vvC7XOX_nAQxdM9taD8t4Sub6FwDODwFj5r2IqZh2zMThg46WAZITqddp-3L55PBODGx8Fa64YupvZou3n82Shfn3IOwDxLLBTGqVQ2BaAJ2qxaVZog7HSgnmBVyiSlRvwHhTM2xyN6zVy7gfyZibWNR878dNBBPL',
        altText: 'Rose-gold detail view of Nocturne Tennis Bracelet',
      },
    ],
  },
  {
    name: 'Seraph Pearl Strand',
    slug: 'seraph-pearl-strand',
    categorySlug: 'necklaces',
    description:
      'A couture-inspired strand of luminous pearls finished with a hidden gold clasp, balancing classic composition with a cleaner, modern proportion.',
    shortDescription: 'Modern pearl strand with a hidden couture clasp.',
    price: 52000,
    comparePrice: 61000,
    sku: 'EC-NKL-002',
    stockQuantity: 12,
    lowStockThreshold: 4,
    isFeatured: false,
    isBestseller: false,
    isNewArrival: true,
    weight: 32.4,
    dimensions: '18 in length',
    metaTitle: 'Seraph Pearl Strand | ECOM',
    metaDescription: 'Pearl necklace with a discreet gold clasp and a timeless editorial silhouette.',
    attributes: {
      metal: '18k yellow gold clasp',
      gemstone: 'Freshwater pearl',
      collection: 'Icons',
      finish: 'High lustre',
    },
    images: [
      {
        imageUrl:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuAMiHZ7HINt6kFVnb_2hSD3EUO0NJXzjGtWLTSO5BHHcjzOlhzQa_47Q9--cmhvYwLiaXSUebkyfvjSuyhHOGKFeMn3GAeb08xysN6QpydFaWyapNnaTfJtW17YxaT9SOdtbX7m6cNj5sqXyqDeAdM-fycPyKZV_sdathphmYMXjaI9q1pYv2L0PsI_F1Yi8npjcNFsSiWRf97cl9z89NlRH_05dq1_Ed1Tj8mZLjRM3huXA1xZ1BtQFmiUIugrCJ0pcDHNhq_pzK7L',
        altText: 'Seraph Pearl Strand classic editorial product shot',
      },
    ],
  },
  {
    name: 'Imperial Emerald Ring',
    slug: 'imperial-emerald-ring',
    categorySlug: 'rings',
    description:
      'A cocktail ring with an emerald-cut center stone and clustered diamond shoulders, created to anchor occasion dressing with a richer color story.',
    shortDescription: 'Cocktail ring with an emerald center and sculpted shoulders.',
    price: 112000,
    comparePrice: 129000,
    sku: 'EC-RNG-002',
    stockQuantity: 5,
    lowStockThreshold: 2,
    isFeatured: false,
    isBestseller: true,
    isNewArrival: false,
    weight: 9.2,
    dimensions: 'Size 7 standard, resizable',
    metaTitle: 'Imperial Emerald Ring | ECOM',
    metaDescription: 'Emerald cocktail ring with diamond shoulders and a polished couture profile.',
    attributes: {
      metal: '18k yellow gold',
      gemstone: 'Emerald and diamond',
      collection: 'Gem Salon',
      finish: 'Mirror polish',
    },
    images: [
      {
        imageUrl:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuAMN6bdIiZ9Gkpa8Uk4QljQ7W4ORvc5hkSYN53363eMJM7Z4uv0qgZiZEWBUq-0pFNBPA4D2u1ugpa85PPCLq7fW3gneaZFG4Y-XhYcMO-E4_cyrAAzYQdW0m7-yxjEKiddpT1lW-6RDAM3Pg5EzPH3kWJRiumdWPxKpxQbZXECTzKlDaGL9PUnofSylzQ6SKWU9gIcb8da60naoD1tb7ErAsQvLA17Gg4rYnxQgXX_L7qZ9Qo1g2LaJWXcF2MhBU8dqinSeOhijcYv',
        altText: 'Imperial Emerald Ring hero shot',
      },
      {
        imageUrl:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuAccaXBsUMcfQa0YmC1fkja8BqM-SdeDS2je1Q3SUzlX7iaMnhZ-pGnmnncma10tQ0fIlDpKP_OUK8yB7ydhJDn3qn0IUgxweLgqceRQSskxOQR8JJeO8F6q8YRw7XcET06nMEt_5NwUcyO9rkh51qT6KMz-OkYXb760tw5_71bjYvvxY3p4-VcqN42iv_TzVmS218JsWari7360jU1a3xNby0qRIk3dMZnHQ7f3qMI8Eh89jOYL9WorZXT2rONhI4b-mYNKLIgjheD',
        altText: 'Imperial Emerald Ring angled studio view',
      },
    ],
  },
  {
    name: 'Lumiere Sculpted Hoops',
    slug: 'lumiere-sculpted-hoops',
    categorySlug: 'earrings',
    description:
      'Rounded gold hoops with softly faceted edges that catch light from every angle, built to move from daytime tailoring to formal dressing.',
    shortDescription: 'Faceted gold hoops with a polished sculptural silhouette.',
    price: 36000,
    comparePrice: 42000,
    sku: 'EC-EAR-002',
    stockQuantity: 15,
    lowStockThreshold: 5,
    isFeatured: true,
    isBestseller: false,
    isNewArrival: true,
    weight: 8.7,
    dimensions: '1.6 in diameter',
    metaTitle: 'Lumiere Sculpted Hoops | ECOM',
    metaDescription: 'Polished gold hoops with sculpted edges for elevated daily jewelry styling.',
    attributes: {
      metal: '18k yellow gold',
      gemstone: 'None',
      backing: 'Hinged snap closure',
      collection: 'Daily Icons',
    },
    images: [
      {
        imageUrl:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuDWVHL6udB-YxWHYOVI_v5UnnjVjWmr952BR5psq9gmi7BKkPSga-auH-K1Re30UUSkFlf7KwxBRqqTCBpISqwTDM25Iu92UNziLHYrP14W3P-MQEwrJwxVkqYO0nWUDFcM4XKprP2bANHUyaT4WX8pEKlASWZIuKpsU2QXy7gLqsG1s2LlVqQQON35M5ohubpVDnr8Mv52m3QdQwLo6axjpgK6TpPnU_0fjrNngbWdhk9s_KcCCJIOZ-5FEHUv8E9zzs0B855Yy6nC',
        altText: 'Lumiere Sculpted Hoops on an ivory background',
      },
      {
        imageUrl:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuAyfMFbNARzWi1S4EiX9_u5q4llgw1_Uvckde3eqD1sB1TlaJRQA_7Pu4d4-oMvZLJmS-AyhCN7rmpB6WqSZSrTIEzzCdh0MeUkFUykyE383vd_oxrI11UwdyJHl9n4SnkrBUNJsAj7qMi1fsXxTpc9XtAnXcusiU5Ov-4kcfn28oB17yWRBLfF97GD3dF9PO82l2NnU1zxP-aKxypmHrPPedsFYLzyds3MLu2rTyae1auZkzDXv-RKr2wR4Ml9GL69soSe73396pB5',
        altText: 'Lumiere Sculpted Hoops side angle',
      },
    ],
  },
  {
    name: 'Meridian Pearl Watch',
    slug: 'meridian-pearl-watch',
    categorySlug: 'watches',
    description:
      'A jewelry-led wristwatch with a mother-of-pearl dial and fine mesh bracelet, created for clients who want timekeeping to feel like adornment.',
    shortDescription: 'Jewelry-inspired watch with a pearl dial and mesh bracelet.',
    price: 68000,
    comparePrice: 79000,
    sku: 'EC-WAT-001',
    stockQuantity: 4,
    lowStockThreshold: 1,
    isFeatured: false,
    isBestseller: false,
    isNewArrival: true,
    weight: 62.1,
    dimensions: '28 mm case',
    metaTitle: 'Meridian Pearl Watch | ECOM',
    metaDescription: 'Mother-of-pearl dial watch with a fine mesh bracelet and luxury jewelry finish.',
    attributes: {
      metal: 'Gold-tone steel',
      movement: 'Quartz',
      dial: 'Mother of pearl',
      collection: 'Timepieces',
    },
    images: [
      {
        imageUrl:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuDoSnLZLyZa246ZHszYJ16ygjNuadQKUpZmeJIiN3tbm2c_wkWStQlFiHXmJAdNGlmvHFug_T2pFK_O8rrvpHTDKqzb6X4vbdaQh1GwoKBnQEmVBBVZUdB9-XL_lAFlfUpY08ATXcrTEmdy19JxeQPSVNEgaC7xeCxOatALvuLHTYadwJJnMoQtuCYvN78zo7_KhMbkigWno8IIKzQ7QwLu6Ix6A2k5hetnqqHbrtuz1Ie9k7LayEIZqtz2aCTHUQ4MzsK3ybfWO02F',
        altText: 'Meridian Pearl Watch laid on silk fabric',
      },
    ],
  },
];

module.exports = {
  seedCategories,
  seedProducts,
};
