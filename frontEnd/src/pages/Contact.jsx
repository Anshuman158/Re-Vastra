import React from 'react';
import Title from '../components/Title';
import { MapPin, Phone, Mail, Send, Clock, Globe } from 'lucide-react';

const Contact = () => {
  return (
    <div className='min-h-screen pb-20'>
      {/* Hero Section */}
      <div className="relative bg-neutral-900 text-white py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-transparent"></div>

        <div className="container-custom relative z-10 text-center">
          <h1 className="text-4xl sm:text-5xl font-display font-bold mb-4">Get in Touch</h1>
          <p className="text-neutral-300 max-w-2xl mx-auto text-lg">
            Have questions about renting or lending? We're here to help you every step of the way.
            Reach out to our dedicated support team.
          </p>
        </div>
      </div>

      <div className='container-custom -mt-10 relative z-20'>
        <div className='bg-white dark:bg-neutral-800 rounded-2xl shadow-xl border border-neutral-100 dark:border-neutral-700 overflow-hidden flex flex-col lg:flex-row'>

          {/* Contact Info Sidebar */}
          <div className='bg-primary-600 dark:bg-primary-700 text-white p-10 lg:w-1/3 flex flex-col justify-between relative overflow-hidden'>
            <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white opacity-5 rounded-full translate-y-1/2 -translate-x-1/2"></div>

            <div className='relative z-10'>
              <h3 className='text-2xl font-display font-bold mb-2'>Contact Information</h3>
              <p className='text-primary-100 mb-8 max-w-xs'>Fill up the form and our Team will get back to you within 24 hours.</p>

              <div className='space-y-6'>
                <div className='flex items-start gap-4'>
                  <Phone className='w-6 h-6 text-primary-200 mt-1' />
                  <div>
                    <h4 className='font-semibold text-white'>Phone</h4>
                    <p className='text-primary-100'>+91 89689 78226</p>
                  </div>
                </div>

                <div className='flex items-start gap-4'>
                  <Mail className='w-6 h-6 text-primary-200 mt-1' />
                  <div>
                    <h4 className='font-semibold text-white'>Email</h4>
                    <p className='text-primary-100'>support@revastra.com</p>
                  </div>
                </div>

                <div className='flex items-start gap-4'>
                  <MapPin className='w-6 h-6 text-primary-200 mt-1' />
                  <div>
                    <h4 className='font-semibold text-white'>Office</h4>
                    <p className='text-primary-100 leading-snug'>
                      VIT Bhopal University,<br />
                      Madhya Pradesh, India
                    </p>
                  </div>
                </div>

                <div className='flex items-start gap-4'>
                  <Clock className='w-6 h-6 text-primary-200 mt-1' />
                  <div>
                    <h4 className='font-semibold text-white'>Hours</h4>
                    <p className='text-primary-100'>Mon - Fri: 9am - 6pm</p>
                  </div>
                </div>
              </div>
            </div>

            <div className='flex gap-4 mt-12 relative z-10'>
              <Globe className='w-6 h-6 text-primary-200 opacity-50 hover:opacity-100 transition-opacity cursor-pointer' />
              {/* Add social icons here if needed */}
            </div>
          </div>

          {/* Contact Form */}
          <div className='p-10 lg:w-2/3 bg-white dark:bg-neutral-800'>
            <form className='space-y-6'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div className='space-y-2'>
                  <label htmlFor="name" className='text-sm font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wide'>Name</label>
                  <input
                    type="text"
                    id="name"
                    className='w-full px-4 py-3 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all text-neutral-800 dark:text-neutral-200'
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div className='space-y-2'>
                  <label htmlFor="email" className='text-sm font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wide'>Email</label>
                  <input
                    type="email"
                    id="email"
                    className='w-full px-4 py-3 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all text-neutral-800 dark:text-neutral-200'
                    placeholder="john@example.com"
                    required
                  />
                </div>
              </div>

              <div className='space-y-2'>
                <label htmlFor="subject" className='text-sm font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wide'>Subject</label>
                <input
                  type="text"
                  id="subject"
                  className='w-full px-4 py-3 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all text-neutral-800 dark:text-neutral-200'
                  placeholder="How can we help?"
                  required
                />
              </div>

              <div className='space-y-2'>
                <label htmlFor="message" className='text-sm font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wide'>Message</label>
                <textarea
                  id="message"
                  rows="6"
                  className='w-full px-4 py-3 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all text-neutral-800 dark:text-neutral-200 resize-none'
                  placeholder="Write your message..."
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                className='inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg shadow-lg shadow-primary-500/30 transition-all transform hover:-translate-y-1 w-full sm:w-auto'
              >
                Send Message <Send size={18} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
