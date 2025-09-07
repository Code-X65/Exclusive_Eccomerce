import React from 'react'
import { ChevronRight, ChevronLeft } from 'lucide-react'
import PlayStation from '../assets/Images/Arrival01.png'
import Woman from '../assets/Images/woman.png'
import Speaker from '../assets/Images/Speaker.png'
import Perfume from '../assets/Images/Perfume.png'
const NewArrival = () => {
  return (
    <>
      <div className='max-w-6xl mx-auto mt-10 mb-10 px-4 sm:px-6 lg:px-8'>
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
            <div className='relative group h-full w-full'>
            <img src={PlayStation} className='bg-black rounded-sm h-full px-4 pt-8' alt="" />
                    <div className='absolute bottom-0 md:opacity-40 group-hover:opacity-100 text-white p-6  z-10 animation-400 duration-300 group-hover:px-10' >

                        <h1 className='text-xl  font-semibold mb-4'>PlayStation 5 </h1>
                        <p className='text-sm mb-2'>Black and white Version of the PS5 <br/> Coming out on side</p>
                        <p className='border-b-2 border-gray-500 flex  w-20 hover:font-semibold hover:w-32 animation-400 duration-300'>Shop Now </p>
                    </div>
            </div>
        </div>
        <div className='grid md:grid-rows-2 gap-2   '>
  <div className='relative group '>
            <img src={Woman} className='bg-black rounded-sm  w-full' alt="" />
                    <div className='absolute bottom-0 md:opacity-40 group-hover:opacity-100 text-white p-6  z-10 animation-400 duration-300 group-hover:px-10' >

                        <h1 className='text-xl  font-semibold mb-4'>Women's Collections</h1>
                        <p className='text-sm mb-2'>Featured woman collections that <br/> give you another vibe</p>
                        <p className='border-b-2 border-gray-500 flex  w-20 hover:font-semibold hover:w-32 animation-400 duration-300'>Shop Now </p>
                    </div>
            </div>
            <div className='grid md:grid-cols-2 gap-4'>
                <div className=' flex-1 relative group w-full h-full'>
            <img src={Speaker} className='bg-black rounded-sm w-full h-full p-8' alt="" />
                    <div className='absolute bottom-0 md:opacity-40 group-hover:opacity-100 text-white p-6  z-10 animation-400 duration-300 group-hover:px-10' >

                        <h1 className='text-xl  font-semibold mb-4'>Speakers </h1>
                        <p className='text-sm mb-2'>Amazon wireless speaker</p>
                        <p className='border-b-2 border-gray-500 flex  w-20 hover:font-semibold hover:w-32 animation-400 duration-300'>Shop Now </p>
                    </div>
            </div>
               <div className=' flex-1 relative group  w-full h-full'>
            <img src={Perfume} className='bg-black rounded-sm w-full h-full p-8' alt="" />
                    <div className='absolute bottom-0 md:opacity-40 group-hover:opacity-100 text-white p-6  z-10 animation-400 duration-300 group-hover:px-10' >

                        <h1 className='text-xl  font-semibold mb-4'>Perfume </h1>
                        <p className='text-sm mb-2 uppercase'>Gucci Intense Qud Edp</p>
                        <p className='border-b-2 border-gray-500 flex  w-20 hover:font-semibold hover:w-32 animation-400 duration-300'>Shop Now </p>
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
