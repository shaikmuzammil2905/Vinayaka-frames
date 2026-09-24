import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { MapPin, Phone, Mail } from 'lucide-react';
import logo from '../assets/logo.jpg';
import footerAnim from '../assets/footer-anim.png';

export const Footer = () => {
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    let active = true;
    api.getSiteSettings().then(data => {
      if (active) setSettings(data);
    });
    return () => { active = false; };
  }, []);

  return (
    <footer className="bg-background-alt pt-0 pb-8 mt-auto border-t border-border">

      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          
          {/* Brand & Info */}
          <div>
            <img src={logo} alt="Vinayak Frames" className="h-16 mb-6 object-contain" />
            <p className="text-text-muted text-sm leading-relaxed mb-6">
              {settings?.footer?.text || 'Turn your memories into beautiful frames. Personalized frames, thoughtful gifts and heartfelt moments — all in one place.'}
            </p>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 text-sm font-medium text-text-main">
                <span className="bg-primary-light text-primary p-1.5 rounded-full">🎁</span>
                FREE Gift Packing
              </div>
              <div className="flex items-center gap-3 text-sm font-medium text-text-main">
                <span className="bg-primary-light text-primary p-1.5 rounded-full">🚚</span>
                All Over India Delivery
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-serif font-semibold mb-6">Quick Links</h3>
            <ul className="space-y-3 text-sm text-text-muted">
              <li><Link to="/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Home</Link></li>
              <li><Link to="/categories" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Shop All</Link></li>
              <li><Link to="/about" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link to="/contact" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Contact</Link></li>
              <li><Link to="/track-order" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Track Order</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-lg font-serif font-semibold mb-6">Categories</h3>
            <ul className="space-y-3 text-sm text-text-muted">
              <li><Link to="/category/birthday-frames" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Birthday Frames</Link></li>
              <li><Link to="/category/wedding-frames" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Wedding Frames</Link></li>
              <li><Link to="/category/baby-frames" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Baby Frames</Link></li>
              <li><Link to="/category/collage-frames" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Collage Frames</Link></li>
              <li><Link to="/category/personalized-gifts" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Personalized Gifts</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-serif font-semibold mb-6">Contact Us</h3>
            <ul className="space-y-4 text-sm text-text-muted">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <span>{settings?.contact?.address || '13-2-248, Beside Saifullah Flyover Bridge, Near Vishal Mart, Ramachandra Nagar, Anantapur – 515001'}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary flex-shrink-0" />
                <span>{settings?.contact?.phone || '9398277441'}</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary flex-shrink-0" />
                <span>{settings?.contact?.email || 'vinayakframes123@gmail.com'}</span>
              </li>
            </ul>
            <div className="flex items-center gap-4 mt-6">
              {settings?.social?.instagram && (
                <a href={settings.social.instagram} target="_blank" rel="noopener noreferrer" className="bg-white p-2.5 rounded-full shadow-sm hover:text-primary hover:shadow-md transition-all text-text-muted">
                  <svg xmlns="http://www.w3.org/20rem/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                </a>
              )}
              {settings?.social?.facebook && (
                <a href={settings.social.facebook} target="_blank" rel="noopener noreferrer" className="bg-white p-2.5 rounded-full shadow-sm hover:text-primary hover:shadow-md transition-all text-text-muted">
                  <svg xmlns="http://www.w3.org/20rem/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                </a>
              )}
              {settings?.social?.youtube && (
                <a href={settings.social.youtube} target="_blank" rel="noopener noreferrer" className="bg-white p-2.5 rounded-full shadow-sm hover:text-primary hover:shadow-md transition-all text-text-muted">
                  <svg xmlns="http://www.w3.org/20rem/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>
                </a>
              )}
            </div>
          </div>

        </div>

        <div className="border-t border-border pt-8 mt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-text-muted">
          <p>{settings?.footer?.copyright || '© 2026 Vinayak Frames & Gifts. All Rights Reserved.'}</p>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="hover:text-primary">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-primary">Terms & Conditions</Link>
            <Link to="/shipping" className="hover:text-primary">Shipping Policy</Link>
          </div>
        </div>
      </div>
      <div className="h-16 md:hidden"></div> {/* Spacer for mobile bottom nav */}
    </footer>
  );
};

export default Footer;
