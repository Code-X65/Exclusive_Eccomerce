import { Bus, Headphones, Shield } from 'lucide-react'
import React, { useState, useEffect, useRef } from 'react'

const CompanyFeatures = () => {
    const [isVisible, setIsVisible] = useState(false)
const [hoveredIndex, setHoveredIndex] = useState(null)
const sectionRef = useRef(null)

useEffect(() => {
  const handleScroll = () => {
    if (sectionRef.current) {
      const rect = sectionRef.current.getBoundingClientRect()
      const inView = rect.top < window.innerHeight * 0.8 && rect.bottom > 0
      if (inView) setIsVisible(true)
    }
  }
  window.addEventListener('scroll', handleScroll)
  handleScroll()
  return () => window.removeEventListener('scroll', handleScroll)
}, [])
    const features = [
        {
            "icons": <Bus />,
            "title": "Free And Fast Delivery",
            "description": "Free delivery on all orders over $140"
        },
        {
            "icons": <Headphones />,
            "title": "24/7 Customer Service",
            "description": "Friendly 24/7 customer support"
        },
        {
            "icons": <Shield />,
            "title": "Money Back Guarantee",
            "description": "we return money within 30days"
        },
    ]
    
  return (
    <>
       <div ref={sectionRef} className='max-w-6xl mx-auto px-4 sm:px-6 my-8 sm:my-10'>
            <div className='flex flex-col sm:flex-row flex-wrap justify-center gap-8 sm:gap-4 md:gap-6 lg:gap-10 items-center mt-6 sm:mt-10'>
               {features.map((feature, index) => {
  return (
    <div 
      className={`flex flex-col items-center w-full sm:w-[45%] md:w-auto transform transition-all duration-700 mb-10 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
      }`}
      style={{ transitionDelay: `${index * 200}ms` }}
      key={index}
      onMouseEnter={() => setHoveredIndex(index)}
      onMouseLeave={() => setHoveredIndex(null)}
    >
      <div 
        className={`flex justify-center items-center bg-gradient-to-br from-gray-900 to-black text-white rounded-full w-16 h-16 sm:w-20 sm:h-20 ring-8 sm:ring-12 ring-gray-200/50 shadow-2xl mb-4 sm:mb-6 transform transition-all duration-500 ${
          hoveredIndex === index ? 'scale-110 ring-red-500/50 rotate-12' : 'scale-100'
        }`}
        style={{
          boxShadow: hoveredIndex === index ? '0 0 40px rgba(239, 68, 68, 0.4)' : '0 10px 30px rgba(0, 0, 0, 0.3)',
          transform: hoveredIndex === index ? 'perspective(1000px) translateZ(20px) rotateY(10deg)' : 'perspective(1000px) translateZ(0px)'
        }}
      >
        <div className={`transition-transform duration-500 ${hoveredIndex === index ? 'scale-125' : 'scale-100'}`}>
          {feature.icons}
        </div>
      </div>
      <div className={`text-center text-base sm:text-lg font-bold mt-2 uppercase transition-all duration-300 ${
        hoveredIndex === index ? 'text-red-500 scale-105' : 'text-black'
      }`}>
        {feature.title}
      </div>
      <div className={`text-center text-xs sm:text-sm mt-1 sm:mt-2 max-w-[250px] transition-all duration-300 ${
        hoveredIndex === index ? 'text-gray-700' : 'text-gray-600'
      }`}>
        {feature.description}
      </div>
    </div>
  )
})}
            </div>
        </div>
    </>
  )
}

export default CompanyFeatures