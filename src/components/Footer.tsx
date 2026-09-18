import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Instagram } from 'lucide-react';
import logo from '../assets/logo.jpg';
import footerAnim from '../assets/footer-anim.png';

export const Footer = () => {
  return (
    <footer className="bg-background-alt pt-0 pb-8 mt-auto border-t border-border">


      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          
          {/* Brand & Info */}
          <div>
            <img src={logo} alt="Vinayak Frames" className="h-16 mb-6 object-contain" />
            <p className="text-text-muted text-sm leading-relaxed mb-6">
              Turn your memories into beautiful frames. Personalized frames, thoughtful gifts and heartfelt moments — all in one place.
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
                <span>13-2-248, Beside Saifullah Flyover Bridge, Near Vishal Mart, Ramachandra Nagar, Anantapur – 515001</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary flex-shrink-0" />
                <span>9398277441</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary flex-shrink-0" />
                <span>vinayakframes123@gmail.com</span>
              </li>
            </ul>
            <div className="flex items-center gap-4 mt-6">
              <a href="https://www.instagram.com/vinayak_photo_gallery?stkn=NjhjZnQyempudTgx" target="_blank" rel="noopener noreferrer" className="bg-white p-2.5 rounded-full shadow-sm hover:text-primary hover:shadow-md transition-all text-text-muted">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

        </div>

        <div className="border-t border-border pt-8 mt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-text-muted">
          <p>© 2026 Vinayak Frames & Gifts. All Rights Reserved.</p>
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
