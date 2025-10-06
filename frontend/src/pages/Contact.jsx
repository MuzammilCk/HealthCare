import { FiMail, FiPhone, FiMapPin, FiBriefcase } from 'react-icons/fi';

export default function Contact() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 transition-colors duration-300">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-text-primary-dark mb-4">
            CONTACT <span className="text-primary">US</span>
          </h1>
          <div className="w-24 h-1 bg-primary mx-auto rounded-full"></div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
          {/* Left Side - Image */}
          <div className="relative">
            <div className="rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src="/src/assets/contact.png" 
                alt="Healthcare Team" 
                className="w-full h-auto object-cover"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=600&fit=crop';
                }}
              />
            </div>
            {/* Decorative Elements */}
            <div className="absolute -top-6 -left-6 w-24 h-24 bg-primary/10 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl"></div>
          </div>

          {/* Right Side - Contact Info */}
          <div className="space-y-8">
            {/* Office Section */}
            <div className="bg-white dark:bg-bg-card-dark rounded-2xl p-8 shadow-lg dark:shadow-card-dark hover:shadow-xl transition-shadow duration-300">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-text-primary-dark mb-6 flex items-center">
                <FiMapPin className="mr-3 text-primary" />
                OUR OFFICE
              </h2>
              <div className="space-y-3 text-gray-600 dark:text-text-secondary-dark">
                <p className="text-lg font-medium">HealthSync Medical Center</p>
                <p>Medical College Road</p>
                <p>Thiruvananthapuram, Kerala 695011</p>
                <div className="pt-4 space-y-2">
                  <div className="flex items-center">
                    <FiPhone className="mr-3 text-primary" />
                    <a href="tel:+914712345678" className="hover:text-primary transition-colors">
                      Tel: +91 (471) 234-5678
                    </a>
                  </div>
                  <div className="flex items-center">
                    <FiMail className="mr-3 text-primary" />
                    <a href="mailto:contact@healthsync.com" className="hover:text-primary transition-colors">
                      Email: contact@healthsync.com
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Careers Section */}
            <div className="bg-gradient-to-br from-primary/5 to-purple-500/5 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-8 border border-primary/10 dark:border-dark-border">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-text-primary-dark mb-4 flex items-center">
                <FiBriefcase className="mr-3 text-primary" />
                CAREERS AT HEALTHSYNC
              </h2>
              <p className="text-gray-600 dark:text-text-secondary-dark mb-6">
                Learn more about our teams and job openings. Join us in revolutionizing healthcare delivery.
              </p>
              <button className="px-6 py-3 bg-white dark:bg-dark-surface border-2 border-primary text-primary font-semibold rounded-lg hover:bg-primary hover:text-white transition-all duration-300 shadow-md hover:shadow-lg dark:hover:bg-primary dark:hover:text-white">
                Explore Jobs
              </button>
            </div>
          </div>
        </div>

        {/* Contact Form Section */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-bg-card-dark rounded-2xl shadow-xl dark:shadow-card-dark p-8 lg:p-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-text-primary-dark mb-8 text-center">
              Send Us a Message
            </h2>
            <form className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-text-secondary-dark mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-text-primary-dark focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-text-secondary-dark mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-text-primary-dark focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    placeholder="john@example.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-text-secondary-dark mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-text-primary-dark focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="+91 98765 43210"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-text-secondary-dark mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-text-primary-dark focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="How can we help you?"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-text-secondary-dark mb-2">
                  Message
                </label>
                <textarea
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-text-primary-dark focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                  placeholder="Tell us more about your inquiry..."
                ></textarea>
              </div>
              <div className="text-center">
                <button
                  type="submit"
                  className="px-8 py-4 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Additional Info Cards */}
        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <div className="bg-white dark:bg-bg-card-dark rounded-xl p-6 shadow-md dark:shadow-card-dark hover:shadow-lg transition-shadow text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiPhone className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">24/7 Support</h3>
            <p className="text-gray-600 text-sm">Round-the-clock assistance for all your healthcare needs</p>
          </div>
          <div className="bg-white dark:bg-bg-card-dark rounded-xl p-6 shadow-md dark:shadow-card-dark hover:shadow-lg transition-shadow text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiMail className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Email Us</h3>
            <p className="text-gray-600 text-sm">Get responses within 24 hours on business days</p>
          </div>
          <div className="bg-white dark:bg-bg-card-dark rounded-xl p-6 shadow-md dark:shadow-card-dark hover:shadow-lg transition-shadow text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiMapPin className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Visit Us</h3>
            <p className="text-gray-600 text-sm">Walk-in consultations available Mon-Sat, 9AM-6PM</p>
          </div>
        </div>
      </div>
    </div>
  );
}