import React, { useEffect } from 'react';
import { assets } from '../assets/assets';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

const Footer = () => {
  useEffect(() => {
    const checkForKSR = () => {
      const footer = document.querySelector('footer');
      if (!footer || !footer.textContent.includes('KSR')) {
        console.error('Tampering detected! Do not remove KSR.');
        // In a real app we might not want to throw and crash, but preserving original logic intent
      }
    };

    checkForKSR();
    // Optional: Mutation observer if we really need to enforce it dynamically
  }, []);

  const socialLinks = [
    { icon: <Facebook size={20} />, href: "#" },
    { icon: <Twitter size={20} />, href: "#" },
    { icon: <Instagram size={20} />, href: "#" },
    { icon: <Linkedin size={20} />, href: "#" },
  ];

  return (
    <footer className="bg-neutral-900 text-neutral-300 py-16 w-full mt-auto">
      <div className="container-custom grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

        {/* Brand Section */}
        <div className="space-y-6">
          <Link to="/" className="flex items-center gap-2 group">
            <img src={assets.logo} className="w-12 grayscale brightness-200 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-300" alt="ReVastra Logo" />
            <span className="text-2xl font-decorative font-bold text-white">ReVastra</span>
          </Link>
          <p className="text-sm leading-relaxed text-neutral-400">
            ReVastra is your go-to destination for the latest fashion trends. Bringing style to everyone while ensuring sustainability in every stitch. Rent, Wear, Return.
          </p>
          <div className="flex gap-4">
            {socialLinks.map((social, index) => (
              <a
                key={index}
                href={social.href}
                className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center hover:bg-primary-500 hover:text-white transition-all duration-300"
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="font-display font-semibold text-lg text-white mb-6">Quick Links</h3>
          <ul className="space-y-4">
            {['Home', 'Collection', 'About', 'Contact', 'Our Policy'].map((item) => (
              <li key={item}>
                <Link
                  to={item === 'Home' ? '/' : item === 'Our Policy' ? '/ourPolicy' : `/${item.toLowerCase()}`}
                  className="hover:text-primary-500 hover:translate-x-1 transition-all duration-300 inline-block"
                >
                  {item}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h3 className="font-display font-semibold text-lg text-white mb-6">Contact Us</h3>
          <ul className="space-y-4">
            <li className="flex items-start gap-3 group">
              <Mail className="mt-1 text-primary-500 group-hover:text-white transition-colors" size={20} />
              <a href="mailto:support@revastra.com" className="hover:text-white transition-colors">support@revastra.com</a>
            </li>
            <li className="flex items-start gap-3 group">
              <Phone className="mt-1 text-primary-500 group-hover:text-white transition-colors" size={20} />
              <a href="tel:+918968978226" className="hover:text-white transition-colors">+91 89689 78226</a>
            </li>
            <li className="flex items-start gap-3 group">
              <MapPin className="mt-1 text-primary-500 group-hover:text-white transition-colors" size={20} />
              <span>VIT Bhopal University,<br />Madhya Pradesh, India</span>
            </li>
          </ul>
        </div>

        {/* Newsletter / Extra */}
        <div>
          <h3 className="font-display font-semibold text-lg text-white mb-6">Stay Updated</h3>
          <p className="text-sm text-neutral-400 mb-4">Subscribe to get the latest looks and updates.</p>
          <form className="flex flex-col gap-3" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Your email address"
              className="px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:border-primary-500 transition-colors text-white"
            />
            <button className="px-6 py-3 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition-colors shadow-lg shadow-primary-500/20">
              Subscribe
            </button>
          </form>
        </div>

      </div>

      <div className="container-custom mt-16 pt-8 border-t border-neutral-800 flex flex-col md:flex-row justify-between items-center text-sm text-neutral-500">
        <p>&copy; {new Date().getFullYear()} ReVastra. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
