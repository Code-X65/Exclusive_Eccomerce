import React from 'react'
import BoomBox from '../assets/Images/BigBoomBox.png'
const Categories = () => {
  return (
    <>
      <div className='max-w-6xl mx-auto bg-black w-full md:flex justify-center items-center p-10 my-8 '>
        <div className='flex-1 text-white'>
        <div>
            <h4 className='font-semibold text-[#00ff66] mb-6'>Categories</h4>
            <h2 className='font-semibold text-5xl mb-6'>Enhanced Your <br /> Music Experience</h2>
        </div>
        <div>

        </div>
        <button className='font-semibold px-4 py-2 bg-[#00ff66] hover:bg-[#00ff66]/90 cursor-pointer'>Buy Now</button>
        </div>
        <div className='flex-1'>
            <img src={BoomBox} alt="" />
        </div>
      </div>
    </>
  )
}

export default Categories
