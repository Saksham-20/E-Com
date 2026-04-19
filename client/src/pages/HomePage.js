import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { IoArrowForward } from 'react-icons/io5';
import { getFeaturedProducts } from '../data/jewelryProducts';
import api from '../services/api';
import { formatCurrency } from '../utils/formatters';
import { getImageUrl } from '../utils/imageUtils';

const fallbackProducts = getFeaturedProducts();

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState(fallbackProducts);

  useEffect(() => {
    let isMounted = true;

    const fetchFeaturedProducts = async () => {
      try {
        const response = await api.get('/products/featured');
        const products = response.data?.data?.products || [];

        if (isMounted && products.length > 0) {
          setFeaturedProducts(products);
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('Falling back to local featured jewelry catalog:', error);
        }
      }
    };

    fetchFeaturedProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  const collections = [
    {
      name: 'Necklaces',
      description: 'Diamond rivieres and sculptural pendants for gala dressing.',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCBgis_grR9CFNTeLnahUlajmU5bJSoP0Ji_yX3mynCMVB8evwWQIdrAO57CrtaJikCU4-iwq1iOuoRsceESJpk-TxfXI9fXHymXu0cvfa9phdCdSlkHpUlDgKSutg-lytU-xpN0pUNEZ8w2aDUsO0KubqXwh7NVfg3aHpMbQWPMD71h5_mxQ5dwPUVhgDyXWIxlrCzv9cCZ8INFsRWyuADl-PKJThtPE_98wWFj5nxtGMKgv7mwDIhLV_uLxwqs5h0_kuHbRN-lDBw',
      href: '/products?category=necklaces',
    },
    {
      name: 'Rings',
      description: 'High-polish solitaires and gemstone statements with heirloom appeal.',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuDWN5C1ju4LUEwax14vhd2eRrPYBHs2owiFX2n4Gti5PLTVQ89MzEzbs_WENCXKk6Kpl1iZCoj53YkPqnnZONbFF78vAZdxVuNarQ6AiarLDdm1ehDLF3DoSA6TaoAARnf-8ayjb-qqCaBz2akOiWRF3tvTkJpuIaiJmsLIsL0LihVEVCtbl6z7rVB_SfW7VVk1t8GX4LOcumerKWh0Rqxe0LVP3NbpJZkmmN9T2Y0nbfpkFNKM_XFckXgvt1Ca2jZyU0L_B9JEfg9_',
      href: '/products?category=rings',
    },
    {
      name: 'Bespoke',
      description: 'Concierge-led commissions translated into modern heirlooms.',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuD99XmZAlOP7Ruoc8O0MztMwqG7akIfSKhuyLQom6twIKgE_EeD_0UTMG08ezAMQhLY8fr0-X_nQNoUoKSJF0nncvQjbHKVeY8a8YmY9IVdW9x1g6XpbJ14z6PHw8sJ_nC1OmH-9bdrVqQOzYd6oit-BCMcnMDGlLezetcHY6OVbOd91pTrVMKkERWTmc5GjrqDFcZRUAZFX0HJWjXULMl4DgSIxPG36mWx8kTir-J5RWu5jaz4k3WiEEENsfPy3OPAILVfbsKARKnm',
      href: '/about',
    },
  ];

  const storyImage =
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDaMBl0ZM4VFy8JDguvf0qsAMEqb_ps283SKaZhxmxOvDNTNyw1hekEpBgDBNiALNbfzTaHggNiMh6hbjr3gF58k6oP1ojFnEbZjnahXsnGhu53zmSIYtJPIDEghDuitV5QZiNlMFzaddwLrDxwWhEqtthDd8Z91DcIeocYOJHgD6jZePCLLbBUsm_W1u49tf7NLreTIK683eB4jKBHxmypCFh9D1J_FsgNBuT562JuMgEj5wPVFOu7o6KdQV4yw8AEB89IXtx4f5A-';

  return (
    <div className="bg-atelier-ivory">
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCFyPNvyhhMIkoe6q39QO2sMiTC2-GUxTdt2U1B8CRofXRPAA9j6dY5oHzcv_a8miyJyL0cNd81tagiJ8NwzqY_iqTQ6Znvmi2RTmYo6WRGrJPcaDilkBZFcTtlePiT-qiO0buZJH3GAOcLjDb7MAyLfqrerPjgtMmXQ8XVAIxtSx8OiNeeUUW-SqIhTADqXGUmSsfAG_jhG6bWxOoVxlnd2utLMgGjowiI-AtzuMn0WBcIBJI4TlIdfCiLGhBx-MOX-vhvS-U-ktTe"
          alt="Luxury jewelry hero"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/45" />

        <div className="relative z-10 text-center text-white px-4 max-w-5xl">
          <p className="atelier-label tracking-[0.45em] text-white/85 mb-5">
            ECOM FINE JEWELRY
          </p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl lg:text-8xl font-headline italic mb-8 text-white"
          >
            Modern heirlooms for luminous occasions.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-2xl mx-auto text-white/80 text-lg md:text-xl mb-10"
          >
            Explore diamond necklaces, sculpted hoops, statement rings, and jewelry-led timepieces designed with a couture editorial point of view.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/products" className="atelier-primary-btn flex items-center gap-2">
              Enter The Vault
              <IoArrowForward className="h-4 w-4" />
            </Link>
            <Link to="/about" className="atelier-link-btn text-white border-white/40 hover:border-white">
              Discover ECOM
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="py-24 md:py-32 bg-atelier-ivory">
        <div className="atelier-container">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
            <div>
              <p className="atelier-label text-atelier-gold mb-4">Curated Departments</p>
              <h2 className="font-headline text-4xl md:text-6xl leading-tight">
                A sharper point of view on fine jewelry.
              </h2>
            </div>
            <p className="max-w-xl text-atelier-muted">
              ECOM balances red-carpet presence with everyday polish, translating precious materials into collections that feel elevated, wearable, and distinctly modern.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
            {collections.map((collection, index) => (
              <motion.div
                key={collection.name}
                className={index === 1 ? 'md:mt-16' : ''}
                whileInView={{ opacity: [0, 1], y: [24, 0] }}
                viewport={{ once: true }}
              >
                <Link to={collection.href} className="group block">
                  <div className="aspect-[3/4] overflow-hidden bg-atelier-surface-low">
                    <img
                      src={collection.image}
                      alt={collection.name}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                  <div className="text-center mt-7">
                    <h3 className="font-headline text-3xl text-atelier-charcoal">{collection.name}</h3>
                    <p className="atelier-label text-atelier-muted mt-1">{collection.description}</p>
                    <span className="inline-block mt-4 atelier-link-btn">Explore</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-atelier-charcoal text-white py-24 md:py-32">
        <div className="atelier-container grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div>
            <p className="atelier-label text-atelier-gold mb-4">Our Perspective</p>
            <h2 className="font-headline text-4xl md:text-6xl italic leading-tight text-white mb-8">
              Jewelry as atmosphere, not just accessory.
            </h2>
            <p className="text-white/75 max-w-lg mb-8">
              ECOM curates fine jewelry with the discipline of a modern maison: deliberate proportions, tactile materials, and a styling language that moves cleanly between ceremony, gifting, and daily ritual.
            </p>
            <Link to="/about" className="atelier-label text-atelier-gold">
              Read Our Story
            </Link>
          </div>
          <div className="relative">
            <div className="absolute -left-6 -top-6 h-full w-full bg-atelier-gold/10" />
            <img src={storyImage} alt="Jewelry craftsmanship" className="relative aspect-[4/5] w-full object-cover" />
          </div>
        </div>
      </section>

      <section className="py-24 md:py-32 bg-[#f4f3f1]">
        <div className="atelier-container">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-14">
            <div>
              <p className="atelier-label text-atelier-gold mb-4">Featured Now</p>
              <h2 className="font-headline text-4xl">The ECOM Edit</h2>
            </div>
            <Link to="/products" className="atelier-link-btn">
              View All Selection
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
            {featuredProducts.slice(0, 4).map((product) => (
              <Link to={`/products/${product.slug || product.id}`} key={product.id} className="group block">
                <div className="aspect-square bg-white overflow-hidden mb-4">
                  <img
                    src={product.primary_image ? getImageUrl(product.primary_image) : product.image}
                    alt={product.name}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="text-center">
                  <p className="atelier-label text-atelier-muted mb-2">
                    {product.category_name || product.category}
                  </p>
                  <h3 className="font-headline text-lg mb-1">{product.name}</h3>
                  <p className="text-atelier-gold text-sm">{formatCurrency(product.price)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
