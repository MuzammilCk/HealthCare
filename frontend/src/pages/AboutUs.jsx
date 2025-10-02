import { FiCheckCircle, FiUsers, FiHeart } from 'react-icons/fi';

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            ABOUT <span className="text-primary">US</span>
          </h1>
          <div className="w-24 h-1 bg-primary mx-auto rounded-full"></div>
        </div>

        {/* Main Content Section */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
          {/* Left Side - Image */}
          <div className="relative">
            <div className="rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src="/src/assets/about.png" 
                alt="Healthcare Professionals" 
                className="w-full h-auto object-cover"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=800&h=600&fit=crop';
                }}
              />
            </div>
            {/* Decorative Elements */}
            <div className="absolute -top-6 -left-6 w-24 h-24 bg-primary/10 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl"></div>
          </div>

          {/* Right Side - Content */}
          <div className="space-y-6">
            <div className="prose prose-lg">
              <p className="text-gray-700 leading-relaxed">
                Welcome to <span className="font-bold text-primary">HealthSync</span>, your trusted partner in managing your healthcare needs conveniently and efficiently. At HealthSync, we understand the challenges individuals face when it comes to scheduling doctor appointments and managing their health records.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                HealthSync is committed to excellence in healthcare technology. We continuously strive to enhance our platform, integrating the latest advancements to improve user experience and deliver superior services. Whether you're booking your first appointment or managing ongoing care, HealthSync is here to support you every step of the way.
              </p>
            </div>

            {/* Vision Section */}
            <div className="bg-gradient-to-br from-primary/5 to-purple-500/5 rounded-2xl p-6 border border-primary/10 mt-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-3 flex items-center">
                <FiHeart className="mr-3 text-primary" />
                Our Vision
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Our vision at HealthSync is to create a seamless healthcare experience for every user. We aim to bridge the gap between patients and healthcare providers, making it easier for you to access the care you need, when you need it.
              </p>
            </div>
          </div>
        </div>

        {/* Why Choose Us Section */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">
            WHY CHOOSE US
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Efficiency Card */}
            <div className="group bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-200 hover:bg-gradient-to-br hover:from-primary hover:to-blue-600 hover:border-transparent transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-primary/10 group-hover:bg-white/20 rounded-full flex items-center justify-center mb-6 transition-colors duration-300">
                <FiCheckCircle className="w-8 h-8 text-primary group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 group-hover:text-white mb-4 transition-colors duration-300">Efficiency:</h3>
              <p className="text-gray-600 group-hover:text-white/90 leading-relaxed transition-colors duration-300">
                Streamlined appointment scheduling that fits into your busy lifestyle.
              </p>
            </div>

            {/* Convenience Card */}
            <div className="group bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-200 hover:bg-gradient-to-br hover:from-primary hover:to-blue-600 hover:border-transparent transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-primary/10 group-hover:bg-white/20 rounded-full flex items-center justify-center mb-6 transition-colors duration-300">
                <FiUsers className="w-8 h-8 text-primary group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 group-hover:text-white mb-4 transition-colors duration-300">Convenience:</h3>
              <p className="text-gray-600 group-hover:text-white/90 leading-relaxed transition-colors duration-300">
                Access to a network of trusted healthcare professionals in your area.
              </p>
            </div>

            {/* Personalization Card */}
            <div className="group bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-200 hover:bg-gradient-to-br hover:from-primary hover:to-blue-600 hover:border-transparent transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-primary/10 group-hover:bg-white/20 rounded-full flex items-center justify-center mb-6 transition-colors duration-300">
                <FiHeart className="w-8 h-8 text-primary group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 group-hover:text-white mb-4 transition-colors duration-300">Personalization:</h3>
              <p className="text-gray-600 group-hover:text-white/90 leading-relaxed transition-colors duration-300">
                Tailored recommendations and reminders to help you stay on top of your health.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-gradient-to-r from-primary to-blue-600 rounded-3xl p-12 text-white shadow-2xl">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold mb-2">500+</div>
              <div className="text-white/80">Verified Doctors</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">10K+</div>
              <div className="text-white/80">Happy Patients</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">50+</div>
              <div className="text-white/80">Partner Hospitals</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">24/7</div>
              <div className="text-white/80">Support Available</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}