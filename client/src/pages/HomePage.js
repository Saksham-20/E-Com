import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { IoArrowForward } from 'react-icons/io5';
import { getFeaturedProducts } from '../data/jewelryProducts';

const HomePage = () => {
  const featuredProducts = getFeaturedProducts();

  const collections = [
    {
      name: 'High Jewelry',
      description: 'Masterpieces of light',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCBgis_grR9CFNTeLnahUlajmU5bJSoP0Ji_yX3mynCMVB8evwWQIdrAO57CrtaJikCU4-iwq1iOuoRsceESJpk-TxfXI9fXHymXu0cvfa9phdCdSlkHpUlDgKSutg-lytU-xpN0pUNEZ8w2aDUsO0KubqXwh7NVfg3aHpMbQWPMD71h5_mxQ5dwPUVhgDyXWIxlrCzv9cCZ8INFsRWyuADl-PKJThtPE_98wWFj5nxtGMKgv7mwDIhLV_uLxwqs5h0_kuHbRN-lDBw',
      href: '/products?category=necklaces'
    },
    {
      name: 'Fine Jewelry',
      description: 'Timeless daily essentials',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDWN5C1ju4LUEwax14vhd2eRrPYBHs2owiFX2n4Gti5PLTVQ89MzEzbs_WENCXKk6Kpl1iZCoj53YkPqnnZONbFF78vAZdxVuNarQ6AiarLDdm1ehDLF3DoSA6TaoAARnf-8ayjb-qqCaBz2akOiWRF3tvTkJpuIaiJmsLIsL0LihVEVCtbl6z7rVB_SfW7VVk1t8GX4LOcumerKWh0Rqxe0LVP3NbpJZkmmN9T2Y0nbfpkFNKM_XFckXgvt1Ca2jZyU0L_B9JEfg9_',
      href: '/products?category=rings'
    },
    {
      name: 'Bespoke Creations',
      description: 'Your vision, our craft',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD99XmZAlOP7Ruoc8O0MztMwqG7akIfSKhuyLQom6twIKgE_EeD_0UTMG08ezAMQhLY8fr0-X_nQNoUoKSJF0nncvQjbHKVeY8a8YmY9IVdW9x1g6XpbJ14z6PHw8sJ_nC1OmH-9bdrVqQOzYd6oit-BCMcnMDGlLezetcHY6OVbOd91pTrVMKkERWTmc5GjrqDFcZRUAZFX0HJWjXULMl4DgSIxPG36mWx8kTir-J5RWu5jaz4k3WiEEENsfPy3OPAILVfbsKARKnm',
      href: '/about'
    }
  ];

  const storyImage = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDaMBl0ZM4VFy8JDguvf0qsAMEqb_ps283SKaZhxmxOvDNTNyw1hekEpBgDBNiALNbfzTaHggNiMh6hbjr3gF58k6oP1ojFnEbZjnahXsnGhu53zmSIYtJPIDEghDuitV5QZiNlMFzaddwLrDxwWhEqtthDd8Z91DcIeocYOJHgD6jZePCLLbBUsm_W1u49tf7NLreTIK683eB4jKBHxmypCFh9D1J_FsgNBuT562JuMgEj5wPVFOu7o6KdQV4yw8AEB89IXtx4f5A-';

  return (
    <div className="bg-atelier-ivory">
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCFyPNvyhhMIkoe6q39QO2sMiTC2-GUxTdt2U1B8CRofXRPAA9j6dY5oHzcv_a8miyJyL0cNd81tagiJ8NwzqY_iqTQ6Znvmi2RTmYo6WRGrJPcaDilkBZFcTtlePiT-qiO0buZJH3GAOcLjDb7MAyLfqrerPjgtMmXQ8XVAIxtSx8OiNeeUUW-SqIhTADqXGUmSsfAG_jhG6bWxOoVxlnd2utLMgGjowiI-AtzuMn0WBcIBJI4TlIdfCiLGhBx-MOX-vhvS-U-ktTe"
          alt="Hero jewelry"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/35" />
        <div className="relative z-10 text-center text-white px-4">
          <p className="atelier-label tracking-[0.4em] text-white/90 mb-5">Fine Artistry Since 1924</p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl lg:text-8xl font-headline italic mb-8 text-white"
          >
            Elegance Redefined.
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex justify-center"
          >
            <Link
              to="/products"
              className="atelier-primary-btn flex items-center gap-2"
            >
              Shop Now
              <IoArrowForward className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="py-24 md:py-32 bg-atelier-ivory">
        <div className="atelier-container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
            {collections.map((collection, index) => (
              <motion.div key={collection.name} className={index === 1 ? 'md:mt-16' : ''} whileInView={{ opacity: [0, 1], y: [24, 0] }} viewport={{ once: true }}>
                <Link to={collection.href} className="group block">
                  <div className="aspect-[3/4] overflow-hidden bg-atelier-surface-low">
                    <img src={collection.image} alt={collection.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  </div>
                  <div className="text-center mt-7">
                    <h3 className="font-headline text-3xl text-atelier-charcoal">{collection.name}</h3>
                    <p className="atelier-label text-atelier-muted mt-1">{collection.description}</p>
                    <span className="inline-block mt-4 atelier-link-btn">Discover</span>
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
            <h2 className="font-headline text-4xl md:text-6xl italic leading-tight text-white mb-8">
              The Heritage of <span className="block">Excellence.</span>
            </h2>
            <p className="text-white/75 max-w-lg mb-8">
              Founded in the heart of Paris, L'Atelier has dedicated a century to the pursuit of absolute brilliance.
              Every stone is ethically sourced, every setting hand-carved by master artisans.
            </p>
            <Link to="/about" className="atelier-label text-atelier-gold">Read Our Story</Link>
          </div>
          <div className="relative">
            <div className="absolute -left-6 -top-6 h-full w-full bg-atelier-gold/10" />
            <img src={storyImage} alt="Artisan story" className="relative aspect-[4/5] w-full object-cover" />
          </div>
        </div>
      </section>

      <section className="py-24 md:py-32 bg-[#f4f3f1]">
        <div className="atelier-container">
          <div className="flex items-end justify-between mb-14">
            <h2 className="font-headline text-4xl">The Atelier Curations</h2>
            <Link to="/products" className="atelier-link-btn">View All Selection</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
            {featuredProducts.slice(0, 4).map((product) => (
              <Link to={`/products/${product.slug || product.id}`} key={product.id} className="group block">
                <div className="aspect-square bg-white overflow-hidden mb-4">
                  <img src={product.image} alt={product.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="text-center">
                  <h3 className="font-headline text-lg mb-1">{product.name}</h3>
                  <p className="text-atelier-gold text-sm">₹{product.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
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
