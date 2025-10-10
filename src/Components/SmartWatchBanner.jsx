import React, { useState, useEffect, useRef } from 'react'
import SmartWatch from '../assets/Images/SmartWatch.png' // Update with your image path
import { Link } from 'react-router-dom'

const SmartWatchBanner = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isVisible, setIsVisible] = useState(false)

const sectionRef = useRef(null)
  
  useEffect(() => {
    setIsVisible(true)
  }, [])

  useEffect(() => {
  const handleScroll = () => {
    if (sectionRef.current) {
      const rect = sectionRef.current.getBoundingClientRect()
      const inView = rect.top < window.innerHeight * 0.8 && rect.bottom > 0
      if (inView && !isVisible) {
        setIsVisible(true)
      }
    }
  }
  window.addEventListener('scroll', handleScroll)
  handleScroll()
  return () => window.removeEventListener('scroll', handleScroll)
}, [isVisible])

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    setMousePosition({ x, y })
  }
  

  return (
    <div
      ref={sectionRef}
      className="max-w-6xl mx-auto bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 w-full overflow-hidden rounded-2xl shadow-2xl my-8"
    >
      <Link to="/Smartwatches">
      <div
        className="md:flex justify-center items-center p-6 sm:p-8 md:p-10 lg:p-12 relative"
        onMouseMove={handleMouseMove}
        style={{
          transform: `perspective(1000px) rotateY(${mousePosition.x * 5}deg) rotateX(${-mousePosition.y * 5}deg)`,
          transition: "transform 0.1s ease-out",
        }}
      >
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute w-64 h-64 bg-cyan-400 rounded-full blur-3xl opacity-20 animate-pulse"
            style={{
              top: "20%",
              left: "10%",
              animation: "float 6s ease-in-out infinite",
            }}
          ></div>
          <div
            className="absolute w-96 h-96 bg-blue-400 rounded-full blur-3xl opacity-10"
            style={{
              bottom: "10%",
              right: "10%",
              animation: "float 8s ease-in-out infinite reverse",
            }}
          ></div>
        </div>

        {/* Text content */}
        <div
          className={`flex-1 text-white relative z-10 mb-8 md:mb-0 transform transition-all duration-1000 ${
            isVisible
              ? "translate-x-0 opacity-100"
              : "-translate-x-full opacity-0"
          }`}
        >
          <div className="mb-8">
            <h4
              className="font-semibold text-cyan-400 mb-4 sm:mb-6 text-sm sm:text-base animate-pulse"
              style={{
                textShadow: "0 0 20px rgba(34, 211, 238, 0.5)",
              }}
            >
              Wearable Tech
            </h4>
            <h2
              className="font-bold text-3xl sm:text-4xl lg:text-5xl mb-6 sm:mb-8 leading-tight"
              style={{
                textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)",
              }}
            >
              Track Your <br />
              <span className="text-cyan-400 inline-block transform hover:scale-110 transition-transform duration-300">
                Fitness Journey
              </span>
            </h2>
          </div>

          {/* Stats counter animation */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
              { value: "7+", label: "Days Battery" },
              { value: "50M", label: "Water Resist" },
              { value: "100+", label: "Sport Modes" },
              { value: "24/7", label: "Heart Monitor" },
            ].map((stat, i) => (
              <div
                key={i}
                className="bg-white/10 backdrop-blur-sm rounded-lg p-3 sm:p-4 text-center transform hover:scale-105 transition-all duration-300 hover:bg-white/20"
                style={{
                  animation: `slideUp 0.6s ease-out ${i * 0.1}s backwards`,
                }}
              >
                <div className="text-xl sm:text-2xl font-bold text-cyan-400">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm opacity-75">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
          <Link to="/Smartwatches">
            <button
              className="font-semibold px-6 sm:px-8 py-3 sm:py-4 bg-cyan-400 hover:bg-cyan-500 cursor-pointer rounded-lg text-black transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-cyan-400/50 active:scale-95 text-sm sm:text-base"
              style={{
                boxShadow: "0 0 30px rgba(34, 211, 238, 0.3)",
              }}
            >
              Shop Now
            </button>
          </Link>
        </div>

        {/* SmartWatch Image with 3D effect */}
        <div
          className={`flex-1 relative z-10 transform transition-all duration-1000 ${
            isVisible
              ? "translate-x-0 opacity-100"
              : "translate-x-full opacity-0"
          }`}
        >
          <div
            className="relative hover:scale-105 transition-all duration-500"
            style={{
              animation: "float 3s ease-in-out infinite",
              transform: `translateZ(50px) rotateY(${
                mousePosition.x * -10
              }deg) rotateX(${mousePosition.y * 10}deg)`,
              filter: "drop-shadow(0 20px 40px rgba(34, 211, 238, 0.3))",
            }}
          >
            {/* SmartWatch Image */}
            <div className="w-full relative">
              <img
                src={SmartWatch}
                alt="Smart Watch"
                className="w-full h-auto object-contain"
              />
              {/* Animated circles behind watch */}
              <div className="absolute inset-0 flex items-center justify-center -z-10">
                <div className="w-full h-full border-4 border-cyan-400/20 rounded-full animate-ping"></div>
                <div className="absolute w-3/4 h-3/4 border-4 border-cyan-400/40 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
</Link>
      <style>
        {`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}
      </style>
    </div>
  )
}

export default SmartWatchBanner