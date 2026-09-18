import React from 'react';
import { MapPin, Phone, Mail, Clock, Award } from 'lucide-react';
import founderImage from '../assets/Founder Profile Photo 1.jpg (1).jpeg';

export const Contact = () => {
  return (
    <div className="bg-gray-50 min-h-screen py-8 pb-24">
      <div className="container-custom">
        <h1 className="text-2xl md:text-3xl font-serif font-bold text-text-main mb-8">Contact Us</h1>
        
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-1/3 space-y-6">
            <div className="bg-white rounded-2xl card-shadow p-6 border border-gray-100">
              <h2 className="text-xl font-serif font-bold text-text-main mb-6">Store Information</h2>
              
              <div className="space-y-6 text-sm">
                <div className="flex items-start gap-4">
                  <div className="bg-primary-light p-3 rounded-full text-primary shrink-0">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-main mb-1">Vinayak Frames Shop</h3>
                    <p className="text-text-muted leading-relaxed">
                      13-2-248, Beside Saifullah Flyover Bridge,<br/>
                      Near Vishal Mart, Ramachandra Nagar,<br/>
                      Anantapur – 515001, Andhra Pradesh
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="bg-primary-light p-3 rounded-full text-primary shrink-0">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-main mb-1">Contact</h3>
                    <p className="text-text-muted mb-1">Phone: 9398277441</p>
                    <p className="text-text-muted">WhatsApp: 9398277441</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="bg-primary-light p-3 rounded-full text-primary shrink-0">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-main mb-1">Email</h3>
                    <p className="text-text-muted">vinayakframes123@gmail.com</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="bg-primary-light p-3 rounded-full text-primary shrink-0">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-main mb-1">Business Hours</h3>
                    <p className="text-text-muted">Mon - Sun: 9:00 AM - 9:00 PM</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 flex gap-4">
                <a href="tel:9398277441" className="flex-1 bg-white border border-primary text-primary font-medium py-2.5 rounded-lg text-center hover:bg-primary-light transition-colors text-sm">Call Now</a>
                <a href="https://wa.me/919398277441" target="_blank" rel="noreferrer" className="flex-1 bg-[#25D366] text-white font-medium py-2.5 rounded-lg text-center hover:bg-[#128C7E] transition-colors text-sm">WhatsApp</a>
              </div>
            </div>
          </div>
          
          <div className="w-full lg:w-2/3">
            <div className="bg-white rounded-2xl card-shadow p-6 border border-gray-100 mb-6">
              <h2 className="text-xl font-serif font-bold text-text-main mb-6">Send us a Message</h2>
              <form className="space-y-4" onSubmit={e => e.preventDefault()}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-main mb-2">Name</label>
                    <input type="text" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-primary" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-main mb-2">Phone</label>
                    <input type="tel" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-primary" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-main mb-2">Message</label>
                  <textarea rows={5} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-primary resize-none"></textarea>
                </div>
                <button className="bg-primary text-white font-medium px-8 py-3 rounded-lg hover:bg-primary-hover transition-colors">Send Message</button>
              </form>
            </div>
            
            <a 
              href="https://maps.app.goo.gl/R2hqPCtNx3JH5hGq5?g_st=ac" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-gray-200 rounded-2xl overflow-hidden aspect-video relative flex items-center justify-center block cursor-pointer group"
            >
              <div className="absolute inset-0 z-10 bg-black/10 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <div className="bg-white text-primary font-bold px-6 py-3 rounded-full shadow-lg transform group-hover:scale-105 transition-transform flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Open in Google Maps
                </div>
              </div>
              <iframe 
                src="https://maps.google.com/maps?q=Vinayak%20Frames%2C%20Beside%20Saifullah%20Flyover%20Bridge%2C%20Near%20Vishal%20Mart%2C%20Ramachandra%20Nagar%2C%20Anantapur&t=&z=16&ie=UTF8&iwloc=&output=embed" 
                width="100%" 
                height="100%" 
                style={{ border: 0, position: 'absolute', inset: 0, pointerEvents: 'none' }} 
                allowFullScreen 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="Vinayak Frames Location Map"
              ></iframe>
            </a>
          </div>
        </div>

        {/* Founder Section */}
        <div className="mt-16 bg-white rounded-3xl card-shadow border border-gray-100 overflow-hidden">
          <div className="flex flex-col md:flex-row">
            <div className="w-full md:w-2/5 h-[400px] md:h-auto relative">
              <img src={founderImage} alt="K. Anil Nayak - Founder" className="w-full h-full object-cover object-top" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-8">
                <h3 className="text-3xl font-serif font-bold text-white mb-1">K. Anil Nayak</h3>
                <p className="text-white/80 font-medium">Founder & Visionary</p>
              </div>
            </div>
            <div className="w-full md:w-3/5 p-8 md:p-12 lg:p-16 flex flex-col justify-center">
              <div className="bg-primary/10 text-primary p-3 rounded-full w-fit mb-6">
                <Award className="h-6 w-6" />
              </div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-text-main mb-6">Crafting Memories Since Inception</h2>
              <p className="text-text-muted text-lg leading-relaxed mb-6">
                "Our vision at Vinayak Frames is not just to sell frames, but to preserve the beautiful moments of our customers' lives. We believe every picture tells a story, and a grand frame is the perfect storyteller."
              </p>
              <div className="text-text-main font-semibold italic text-xl">
                - K. Anil Nayak
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
