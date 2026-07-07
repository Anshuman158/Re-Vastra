import React from 'react';
import { Repeat, Headphones, Award, Truck, Clock, Shield } from 'lucide-react';

const OurPolicy = () => {
  const policies = [
    {
      icon: <Repeat className="w-8 h-8" />,
      title: "Easy Exchange Policy",
      description: "Not satisfied? Exchange hassle-free within 24 hours of delivery. No questions asked.",
      color: "from-blue-500 to-indigo-500",
      bgLight: "bg-blue-50",
      bgDark: "dark:bg-blue-900/20"
    },
    {
      icon: <Headphones className="w-8 h-8" />,
      title: "24/7 Customer Support",
      description: "Our dedicated team is available round-the-clock to assist you with any queries or concerns.",
      color: "from-emerald-500 to-teal-500",
      bgLight: "bg-emerald-50",
      bgDark: "dark:bg-emerald-900/20"
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "Quality Assurance",
      description: "Every item is thoroughly inspected and cleaned before delivery to ensure premium quality.",
      color: "from-purple-500 to-pink-500",
      bgLight: "bg-purple-50",
      bgDark: "dark:bg-purple-900/20"
    },
    {
      icon: <Truck className="w-8 h-8" />,
      title: "Campus Delivery",
      description: "Fast and reliable delivery right to your hostel or campus location. Open-box delivery for safety.",
      color: "from-orange-500 to-red-500",
      bgLight: "bg-orange-50",
      bgDark: "dark:bg-orange-900/20"
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "Flexible Rental Duration",
      description: "Rent for as long as you need - from a single day to several weeks. You're in control.",
      color: "from-cyan-500 to-blue-500",
      bgLight: "bg-cyan-50",
      bgDark: "dark:bg-cyan-900/20"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Secure Transactions",
      description: "Your payments and personal data are protected with industry-standard security measures.",
      color: "from-rose-500 to-pink-500",
      bgLight: "bg-rose-50",
      bgDark: "dark:bg-rose-900/20"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-neutral-50 to-white dark:from-neutral-900 dark:to-neutral-950">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full text-sm font-semibold mb-4">
            Our Commitment
          </span>
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-neutral-800 dark:text-neutral-100 mb-4">
            Why Shop With Us?
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto text-lg">
            We prioritize your convenience and satisfaction at every step of your fashion journey
          </p>
        </div>

        {/* Policies Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {policies.map((policy, index) => (
            <div
              key={index}
              className={`group relative ${policy.bgLight} ${policy.bgDark} rounded-2xl p-8 hover:shadow-xl transition-all duration-500 border border-transparent hover:border-neutral-200 dark:hover:border-neutral-700 overflow-hidden`}
            >
              {/* Gradient Overlay on Hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${policy.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>

              {/* Icon */}
              <div className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${policy.color} flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                {policy.icon}
              </div>

              {/* Content */}
              <h3 className="relative text-xl font-display font-bold text-neutral-800 dark:text-neutral-100 mb-3 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors">
                {policy.title}
              </h3>
              <p className="relative text-neutral-600 dark:text-neutral-400 leading-relaxed">
                {policy.description}
              </p>

              {/* Decorative Circle */}
              <div className={`absolute -bottom-8 -right-8 w-32 h-32 bg-gradient-to-br ${policy.color} opacity-10 rounded-full group-hover:opacity-20 group-hover:scale-125 transition-all duration-500`}></div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-white dark:bg-neutral-800 rounded-full shadow-soft border border-neutral-100 dark:border-neutral-700">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-neutral-600 dark:text-neutral-400 text-sm">
              Join <strong className="text-neutral-800 dark:text-neutral-200">10,000+</strong> happy customers who trust ReVastra
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OurPolicy;
