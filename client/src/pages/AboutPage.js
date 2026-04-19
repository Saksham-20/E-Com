import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { IoArrowForward, IoDiamond, IoRose, IoSparkles } from 'react-icons/io5';

const AboutPage = () => {
  const values = [
    {
      icon: <IoDiamond className="w-8 h-8 text-atelier-gold" />,
      title: 'Precision',
      description: 'Every silhouette is selected for balance, finish, and the kind of proportion that still feels relevant years later.',
    },
    {
      icon: <IoRose className="w-8 h-8 text-atelier-gold" />,
      title: 'Emotion',
      description: 'Our assortments are built around gifting, ceremony, and personal milestones rather than trend cycles alone.',
    },
    {
      icon: <IoSparkles className="w-8 h-8 text-atelier-gold" />,
      title: 'Modernity',
      description: 'ECOM combines couture styling cues with cleaner lines so each piece moves between occasion and everyday wear.',
    },
  ];

  const milestones = [
    { year: '2016', title: 'The Studio Opens', description: 'ECOM begins as a tightly edited jewelry studio focused on modern heirlooms.' },
    { year: '2018', title: 'Private Client Services', description: 'Concierge sourcing and custom design consultations are introduced for milestone gifting.' },
    { year: '2021', title: 'The Vault Expands', description: 'The assortment grows into rings, necklaces, earrings, bracelets, and jewelry-led timepieces.' },
    { year: '2024', title: 'Editorial Curation', description: 'The house sharpens its point of view around polished, collectible, occasion-ready pieces.' },
    { year: '2026', title: 'Digital Maison', description: 'ECOM launches a more flexible catalog designed to support curated jewelry today and broader luxury categories tomorrow.' },
  ];

  return (
    <div className="min-h-screen bg-atelier-ivory pt-20">
      <section className="relative overflow-hidden border-b border-atelier-outline/30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(212,175,55,0.18),_transparent_34%),linear-gradient(135deg,_rgba(255,255,255,0.9),_rgba(244,243,241,0.85))]" />
        <div className="atelier-container relative py-24 md:py-32">
          <div className="max-w-4xl">
            <p className="atelier-label text-atelier-gold mb-5">About ECOM</p>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="font-headline text-5xl md:text-7xl leading-tight mb-8"
            >
              A fine jewelry house built around atmosphere, ceremony, and polish.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15 }}
              className="text-lg md:text-xl text-atelier-muted max-w-2xl"
            >
              ECOM curates sculptural rings, luminous necklaces, precision earrings, bracelets, and timepieces with a luxury editorial point of view. The aim is simple: make every piece feel collectible, wearable, and worthy of the moment it marks.
            </motion.p>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="atelier-container grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-12 lg:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <p className="atelier-label text-atelier-gold mb-4">Our Story</p>
            <h2 className="font-headline text-4xl md:text-5xl mb-6">Curated with the discipline of a modern maison.</h2>
            <p className="mb-5">
              ECOM was created for clients who want luxury jewelry to feel intentional rather than excessive. Our collections focus on proportion, clarity of finish, and a tactile sense of quality that reads as quietly powerful.
            </p>
            <p className="mb-8">
              From engagement silhouettes and emerald statements to pearl strands and jewelry-led watches, each selection is made to work across occasions, wardrobes, and gifting rituals without losing a couture edge.
            </p>
            <Link to="/products" className="atelier-link-btn inline-flex items-center gap-2">
              Explore The Catalog
              <IoArrowForward className="h-4 w-4" />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="aspect-[4/5] bg-atelier-charcoal p-8 text-white flex flex-col justify-between">
              <div>
                <p className="atelier-label text-atelier-gold mb-4">House Note</p>
                <h3 className="font-headline text-3xl md:text-4xl italic mb-6 text-white">
                  Jewelry should carry presence before it asks for attention.
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="atelier-label text-white/60 mb-2">Focus</p>
                  <p className="text-white">Fine jewelry and collectible accessories</p>
                </div>
                <div>
                  <p className="atelier-label text-white/60 mb-2">Approach</p>
                  <p className="text-white">Editorial curation with concierge care</p>
                </div>
                <div>
                  <p className="atelier-label text-white/60 mb-2">Materials</p>
                  <p className="text-white">Diamonds, pearls, precious metals, and gemstone color</p>
                </div>
                <div>
                  <p className="atelier-label text-white/60 mb-2">Experience</p>
                  <p className="text-white">Gift-ready, occasion-ready, and timelessly styled</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-20 md:py-28 bg-[#f4f3f1]">
        <div className="atelier-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <p className="atelier-label text-atelier-gold mb-4">Values</p>
            <h2 className="font-headline text-4xl md:text-5xl mb-4">What shapes the ECOM point of view.</h2>
            <p className="max-w-2xl mx-auto">
              The studio is guided by restraint, quality, and emotional relevance so the assortment feels elevated without becoming anonymous.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="bg-white border border-atelier-outline/30 p-8 text-center"
              >
                <div className="w-16 h-16 bg-atelier-surface-low rounded-full flex items-center justify-center mx-auto mb-5">
                  {value.icon}
                </div>
                <h3 className="font-headline text-2xl mb-3">{value.title}</h3>
                <p>{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28 bg-white">
        <div className="atelier-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <p className="atelier-label text-atelier-gold mb-4">Journey</p>
            <h2 className="font-headline text-4xl md:text-5xl mb-4">A brand designed to grow beyond one category.</h2>
            <p className="max-w-2xl mx-auto">
              The platform is still jewelry-led, but the catalog foundation is now flexible enough to support future luxury product lines without a full rebuild.
            </p>
          </motion.div>

          <div className="space-y-6">
            {milestones.map((milestone, index) => (
              <motion.div
                key={milestone.year}
                initial={{ opacity: 0, x: index % 2 === 0 ? -24 : 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.12 }}
                className="grid grid-cols-1 md:grid-cols-[120px_1fr] gap-6 items-start border border-atelier-outline/25 p-6 md:p-8"
              >
                <div className="font-headline text-4xl text-atelier-gold">{milestone.year}</div>
                <div>
                  <h3 className="font-headline text-2xl mb-2">{milestone.title}</h3>
                  <p>{milestone.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-24 bg-atelier-charcoal text-white">
        <div className="atelier-container text-center max-w-4xl">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-headline text-4xl md:text-5xl italic text-white mb-4"
          >
            Discover pieces that feel ceremonial, not disposable.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-white/80 text-lg mb-8"
          >
            Explore the ECOM vault to find diamond statements, polished everyday icons, and occasion-ready gifts with a sharper luxury sensibility.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/products" className="atelier-primary-btn">
              Shop Jewelry
            </Link>
            <Link to="/products?sort=curated" className="atelier-link-btn text-white border-white/40 hover:border-white">
              View Featured Pieces
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
