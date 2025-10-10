
import { useState, useEffect, useRef } from 'react'

import PlayStation from '../assets/Images/Arrival01.png'
import Woman from '../assets/Images/woman.png'
import Speaker from '../assets/Images/Speaker.png'
import Perfume from '../assets/Images/Perfume.png'
const NewArrival = () => {
  const [scrollY, setScrollY] = useState(0)
const [isVisible, setIsVisible] = useState(false)
const sectionRef = useRef(null)

useEffect(() => {
  const handleScroll = () => {
    if (sectionRef.current) {
      const rect = sectionRef.current.getBoundingClientRect()
      const inView = rect.top < window.innerHeight && rect.bottom > 0
      setIsVisible(inView)
      setScrollY(window.scrollY)
    }
  }
  window.addEventListener('scroll', handleScroll)
  handleScroll()
  return () => window.removeEventListener('scroll', handleScroll)
}, [])
  return (
    <>
      <div ref={sectionRef} className='max-w-6xl mx-auto mt-10 mb-10 px-4 sm:px-6 lg:px-8'>
        <div className="flex items-center mb-6">
        <div className="w-4 h-10 bg-red-500 rounded mr-2"></div>
        <h2 className="text-md font-bold text-red-500">Featured</h2>
      </div>

      <div className="flex justify-between items-center mb-8 ">
        <h1 className="text-4xl font-bold">New Arrival</h1>
        
        <div className="flex items-center gap-4">
         

        </div>
      </div>
      <div className='grid md:grid-cols-2 gap-4 '>

        <div className=''>
            <div className={`transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
  <div className='relative group h-full w-full overflow-hidden rounded-lg' 
       style={{
         transform: isVisible ? `perspective(1000px) rotateY(${Math.sin(scrollY * 0.002) * 5}deg) translateZ(20px)` : 'none',
         transition: 'transform 0.3s ease-out'
       }}>
    <img src={PlayStation} className='bg-black rounded-sm h-full px-4 pt-8 transform group-hover:scale-110 transition-transform duration-500' alt="" />
    <div className='absolute bottom-0 opacity-0 md:opacity-40 group-hover:opacity-100 text-white p-4 sm:p-6 z-10 transition-all duration-300 group-hover:px-6 sm:group-hover:px-10'>
      <h1 className='text-lg sm:text-xl font-semibold mb-2 sm:mb-4'>PlayStation 5</h1>
      <p className='text-xs sm:text-sm mb-2'>Black and white Version of the PS5 <br/> Coming out on side</p>
      <p className='border-b-2 border-gray-500 inline-block w-20 hover:font-semibold hover:w-32 transition-all duration-300 cursor-pointer'>Shop Now</p>
    </div>
  </div>
</div>
        </div>
        <div className={`grid md:grid-rows-2 gap-2 transform transition-all duration-1000 delay-200 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
<div className='relative group overflow-hidden rounded-lg'
     style={{
       transform: isVisible ? `perspective(1000px) rotateX(${Math.sin(scrollY * 0.003) * 3}deg)` : 'none',
       transition: 'transform 0.3s ease-out'
     }}>
  <img src={Woman} className='bg-black rounded-sm w-full transform group-hover:scale-110 transition-transform duration-500' alt="" />
  <div className='absolute bottom-0 opacity-0 md:opacity-40 group-hover:opacity-100 text-white p-4 sm:p-6 z-10 transition-all duration-300 group-hover:px-6 sm:group-hover:px-10'>
    <h1 className='text-lg sm:text-xl font-semibold mb-2 sm:mb-4'>Women's Collections</h1>
    <p className='text-xs sm:text-sm mb-2'>Featured woman collections that <br/> give you another vibe</p>
    <p className='border-b-2 border-gray-500 inline-block w-20 hover:font-semibold hover:w-32 transition-all duration-300 cursor-pointer'>Shop Now</p>
  </div>
</div>
            <div className='grid md:grid-cols-2 gap-4'>
             <div className='flex-1 relative group w-full h-full overflow-hidden rounded-lg'
     style={{
       transform: isVisible ? `perspective(1000px) translateZ(${Math.sin(scrollY * 0.004) * 20}px) rotateZ(${Math.sin(scrollY * 0.002) * 2}deg)` : 'none',
       transition: 'transform 0.3s ease-out'
     }}>
  <img src={Speaker} className='bg-black rounded-sm w-full h-full p-4 sm:p-8 transform group-hover:scale-110 transition-transform duration-500' alt="" />
  <div className='absolute bottom-0 opacity-0 md:opacity-40 group-hover:opacity-100 text-white p-3 sm:p-6 z-10 transition-all duration-300 group-hover:px-4 sm:group-hover:px-10'>
    <h1 className='text-base sm:text-xl font-semibold mb-2 sm:mb-4'>Speakers</h1>
    <p className='text-xs sm:text-sm mb-2'>Amazon wireless speaker</p>
    <p className='border-b-2 border-gray-500 inline-block w-20 hover:font-semibold hover:w-32 transition-all duration-300 cursor-pointer'>Shop Now</p>
  </div>
</div>
             <div className='flex-1 relative group w-full h-full overflow-hidden rounded-lg'
     style={{
       transform: isVisible ? `perspective(1000px) translateZ(${Math.cos(scrollY * 0.004) * 20}px) rotateZ(${Math.cos(scrollY * 0.002) * 2}deg)` : 'none',
       transition: 'transform 0.3s ease-out'
     }}>
  <img src={Perfume} className='bg-black rounded-sm w-full h-full p-4 sm:p-8 transform group-hover:scale-110 transition-transform duration-500' alt="" />
  <div className='absolute bottom-0 opacity-0 md:opacity-40 group-hover:opacity-100 text-white p-3 sm:p-6 z-10 transition-all duration-300 group-hover:px-4 sm:group-hover:px-10'>
    <h1 className='text-base sm:text-xl font-semibold mb-2 sm:mb-4'>Perfume</h1>
    <p className='text-xs sm:text-sm mb-2 uppercase'>Gucci Intense Qud Edp</p>
    <p className='border-b-2 border-gray-500 inline-block w-20 hover:font-semibold hover:w-32 transition-all duration-300 cursor-pointer'>Shop Now</p>
  </div>
</div>
            </div>
        </div>
      </div>
      </div>
    </>
  )
}

export default NewArrival
