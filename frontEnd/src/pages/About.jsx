import React from 'react'
import Title from '../components/Title'
import { assets } from '../assets/assets'
import { Recycle, Heart, Shield, Users, Sparkles, Leaf, ArrowRight } from 'lucide-react'

const About = () => {
  const values = [
    {
      icon: <Recycle className="w-8 h-8" />,
      title: "India's First Platform",
      description: "India's first company providing a platform where users can lend their clothes, building a sustainable sharing economy.",
      color: "from-blue-500 to-cyan-400"
    },
    {
      icon: <Leaf className="w-8 h-8" />,
      title: "Sustainability Focused",
      description: "We promote eco-friendly choices by encouraging re-use, helping reduce waste, and giving clothes a second life.",
      color: "from-green-500 to-emerald-400"
    },
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: "Affordable Fashion",
      description: "Rent high-quality clothes at affordable prices, making premium fashion accessible to everyone.",
      color: "from-purple-500 to-pink-400"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Secure & Reliable",
      description: "We prioritize security and reliability, ensuring every transaction is smooth and trustworthy.",
      color: "from-orange-500 to-amber-400"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Community Driven",
      description: "Our community-based approach creates a space where everyone benefits from shared resources.",
      color: "from-rose-500 to-red-400"
    }
  ]

  const team = [
    { name: "Founder", role: "Visionary Leader", img: assets.founder_img },
    { name: "Developer", role: "Tech Innovator", img: assets.developer_img },
    { name: "Designer", role: "Creative Mind", img: assets.designer_img },
    { name: "Marketing", role: "Growth Expert", img: assets.marketing_img },
  ]

  return (
    <div className='min-h-screen'>
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden bg-gradient-to-br from-primary-50 via-white to-accent-purple/10 dark:from-neutral-900 dark:via-neutral-950 dark:to-neutral-900">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-20 w-72 h-72 bg-primary-200/30 dark:bg-primary-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-accent-purple/20 dark:bg-accent-purple/10 rounded-full blur-3xl"></div>
        </div>

        <div className="container-custom relative z-10">
          <div className="text-center mb-8">
            <Title text1={'ABOUT'} text2={'US'} />
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary-500 to-accent-purple rounded-2xl opacity-20 blur-xl"></div>
              <img
                className='relative w-full rounded-2xl shadow-2xl transform hover:scale-[1.02] transition-all duration-500'
                src={assets.about_img}
                alt="About ReVastra"
              />
            </div>

            <div className='space-y-6 text-neutral-700 dark:text-neutral-300'>
              <h2 className="text-3xl font-display font-bold text-neutral-800 dark:text-neutral-100">
                Revolutionizing Fashion Through Sharing
              </h2>
              <p className='text-lg leading-relaxed'>
                At ReVastra, we believe that fashion should be <span className="text-primary-600 dark:text-primary-400 font-semibold">accessible, sustainable, and community-driven</span>.
                We're India's first fashion rental platform that lets you rent premium clothing or earn by lending your wardrobe.
              </p>
              <p className='text-lg leading-relaxed'>
                Our mission is to reduce fashion waste while ensuring everyone can look their best without breaking the bank.
                Join the movement towards a more <span className="text-primary-600 dark:text-primary-400 font-semibold">circular fashion economy</span>.
              </p>
              <button
                onClick={() => window.location.href = '/collection'}
                className="btn-primary inline-flex items-center gap-2 mt-4"
              >
                Explore Collection <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-4 bg-neutral-50 dark:bg-neutral-900">
        <div className="container-custom">
          <div className='text-center mb-16'>
            <Title text1={'WHY'} text2={'CHOOSE US'} />
            <p className="text-neutral-600 dark:text-neutral-400 mt-4 max-w-2xl mx-auto">
              We're more than just a rental platform - we're building a sustainable fashion revolution
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className="group relative bg-white dark:bg-neutral-800 rounded-2xl p-8 shadow-soft hover:shadow-medium transition-all duration-300 border border-neutral-100 dark:border-neutral-700 overflow-hidden"
              >
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${value.color} opacity-10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:opacity-20 transition-opacity`}></div>
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${value.color} flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                  {value.icon}
                </div>
                <h3 className='font-display font-bold text-xl text-neutral-800 dark:text-neutral-100 mb-3'>{value.title}</h3>
                <p className='text-neutral-600 dark:text-neutral-400 leading-relaxed'>{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 px-4 bg-white dark:bg-neutral-950">
        <div className="container-custom">
          <div className='text-center mb-16'>
            <Title text1={'OUR'} text2={'TEAM'} />
            <p className="text-neutral-600 dark:text-neutral-400 mt-4">
              Meet the passionate people behind ReVastra
            </p>
          </div>

          <div className='flex flex-wrap justify-center gap-10'>
            {team.map((member, index) => (
              <div
                key={index}
                className='group text-center w-56'
              >
                <div className="relative mb-6">
                  <div className="absolute -inset-2 bg-gradient-to-r from-primary-500 to-accent-purple rounded-full opacity-0 group-hover:opacity-50 blur-lg transition-opacity duration-300"></div>
                  <img
                    src={member.img}
                    alt={member.name}
                    className='relative w-32 h-32 object-cover rounded-full shadow-lg mx-auto ring-4 ring-white dark:ring-neutral-800 group-hover:scale-105 transition-transform duration-300'
                  />
                </div>
                <h3 className='text-lg font-bold text-neutral-800 dark:text-neutral-200'>{member.name}</h3>
                <p className='text-sm text-primary-600 dark:text-primary-400 font-medium'>{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default About;
