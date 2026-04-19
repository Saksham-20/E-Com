import React from 'react';
import { Link } from 'react-router-dom';
import { FiGlobe, FiArrowRight } from 'react-icons/fi';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: 'The House',
      links: [
        { name: 'Our Story', href: '/about' },
        { name: 'Craftsmanship', href: '/about' },
        { name: 'Editorial Curation', href: '/about' },
        { name: 'Private Appointments', href: '/about' },
      ],
    },
    {
      title: 'Customer Care',
      links: [
        { name: 'Contact Us', href: '/profile' },
        { name: 'Shipping & Returns', href: '/orders' },
        { name: 'Care Guide', href: '/about' },
        { name: 'Privacy Policy', href: '/about' },
      ],
    },
    {
      title: 'Services',
      links: [
        { name: 'Bespoke Design', href: '/about' },
        { name: 'Gift Concierge', href: '/about' },
        { name: 'Bridal Styling', href: '/products?category=rings' },
        { name: 'Collectible Watches', href: '/products?category=watches' },
      ],
    },
  ];

  return (
    <footer className="pt-24 pb-10 bg-[#f6f6f4] border-t border-atelier-outline/30">
      <div className="atelier-container grid grid-cols-1 md:grid-cols-4 gap-10">
        <div>
          <Link to="/" className="font-headline text-2xl tracking-tight">
            ECOM
          </Link>
          <p className="mt-5 atelier-label text-atelier-muted leading-relaxed max-w-[240px]">
            Fine jewelry, polished gifting, and modern heirlooms curated with an editorial luxury lens.
          </p>
        </div>

        {footerSections.map((section) => (
          <div key={section.title}>
            <h4 className="atelier-label text-atelier-charcoal font-semibold mb-5">{section.title}</h4>
            <ul className="space-y-3">
              {section.links.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="atelier-label text-atelier-muted hover:text-atelier-charcoal">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="atelier-container mt-14 border-t border-atelier-outline/30 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="atelier-label text-atelier-muted">&copy; {currentYear} ECOM Fine Jewelry. All rights reserved.</p>
        <div className="flex items-center gap-3 text-atelier-muted">
          <FiGlobe className="h-3.5 w-3.5" />
          <span className="atelier-label">Global - English</span>
          <FiArrowRight className="h-3.5 w-3.5" />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
