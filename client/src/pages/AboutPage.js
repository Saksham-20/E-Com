import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { IoArrowForward, IoStar, IoDiamond, IoHeart } from 'react-icons/io5';

const AboutPage = () => {
  const values = [
    {
      icon: <IoDiamond className="w-8 h-8 text-tiffany-blue" />,
      title: 'Excellence',
      description: 'We strive for perfection in every piece we create, ensuring the highest quality standards.'
    },
    {
      icon: <IoHeart className="w-8 h-8 text-tiffany-blue" />,
      title: 'Passion',
      description: 'Our love for luxury jewelry drives us to create timeless pieces that inspire and delight.'
    },
    {
      icon: <IoStar className="w-8 h-8 text-tiffany-blue" />,
      title: 'Innovation',
      description: 'We continuously push boundaries in design and craftsmanship to create extraordinary pieces.'
    }
  ];

  const milestones = [
    { year: '1837', title: 'Founded', description: 'Charles Lewis Tiffany founded Tiffany & Co. in New York' },
    { year: '1845', title: 'First Catalog', description: 'Published the first Blue Book catalog' },
    { year: '1886', title: 'Tiffany Setting', description: 'Introduced the iconic six-prong diamond engagement ring' },
    { year: '1961', title: 'Breakfast at Tiffany\'s', description: 'Featured in the iconic Audrey Hepburn film' },
    { year: '2012', title: 'LVMH Partnership', description: 'Became part of the LVMH luxury group' }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-playfair"
            >
              About Tiffany & Co.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-lg text-gray-600 max-w-3xl mx-auto"
            >
              For over 180 years, Tiffany & Co. has been the world's premier jeweler, 
              creating extraordinary pieces that celebrate life's most meaningful moments.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6 font-playfair">
                Our Story
              </h2>
              <p className="text-base text-gray-600 mb-4">
                Founded in 1837 by Charles Lewis Tiffany, Tiffany & Co. began as a small 
                stationery and fancy goods emporium in New York City. Over the decades, 
                we have grown into the world's most iconic luxury jewelry brand, 
                synonymous with elegance, quality, and innovation.
              </p>
              <p className="text-base text-gray-600 mb-6">
                Our signature Tiffany Blue color, first used in our 1845 catalog, 
                has become one of the most recognizable colors in the world. 
                Today, we continue to create extraordinary pieces that capture 
                the imagination and celebrate life's most precious moments.
              </p>
              <Link
                to="/collections"
                className="inline-flex items-center text-tiffany-blue hover:text-tiffany-blue-dark font-semibold text-base group"
              >
                Explore Our Collections
                <IoArrowForward className="ml-2 group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="aspect-square bg-gradient-to-br from-tiffany-blue/10 to-tiffany-blue/5 rounded-2xl flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 bg-tiffany-blue/20 rounded-full flex items-center justify-center mb-4 mx-auto">
                    <IoDiamond className="w-12 h-12 text-tiffany-blue" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Since 1837</h3>
                  <p className="text-sm text-gray-600">Creating extraordinary jewelry</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Values Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4 font-playfair">
              Our Values
            </h2>
            <p className="text-base text-gray-600 max-w-2xl mx-auto">
              These core principles guide everything we do and every piece we create.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                  {value.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {value.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4 font-playfair">
              Our Journey
            </h2>
            <p className="text-base text-gray-600 max-w-2xl mx-auto">
              Key milestones in our 180+ year history of creating extraordinary jewelry.
            </p>
          </motion.div>

          <div className="space-y-8">
            {milestones.map((milestone, index) => (
              <motion.div
                key={milestone.year}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className={`flex flex-col md:flex-row items-center gap-6 ${
                  index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
              >
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 bg-tiffany-blue text-white rounded-full flex items-center justify-center font-bold text-lg">
                    {milestone.year}
                  </div>
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {milestone.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {milestone.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-tiffany-blue to-tiffany-blue-dark">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl font-bold text-white mb-4 font-playfair"
          >
            Experience the Tiffany Difference
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-white/90 mb-8"
          >
            Discover our exquisite collections and find the perfect piece to celebrate your special moments.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              to="/collections"
              className="bg-white text-tiffany-blue px-6 py-3 rounded-lg text-base font-semibold hover:bg-gray-100 transition-colors duration-300"
            >
              Explore Collections
            </Link>
            <Link
              to="/products"
              className="border-2 border-white text-white px-6 py-3 rounded-lg text-base font-semibold hover:bg-white hover:text-tiffany-blue transition-all duration-300"
            >
              Shop Now
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;

