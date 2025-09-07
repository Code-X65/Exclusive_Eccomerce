import React from 'react'
import image from '../assets/Images/BlogImage.png'
import { useState, useEffect, useRef } from 'react';
import { Heart, Eye, ChevronLeft, ChevronRight, Phone, Computer, Watch, Headphones, Gamepad, Camera, Store, DollarSignIcon, DollarSign, HandCoins,  } from 'lucide-react';

const AboutHero = () => {
    const BrowserCategory = [
    { icon: <Store  />, title: "Sallers active our site", price: "10.5" },
    { icon: <DollarSignIcon />, title: "Mopnthly Produduct Sale", price: "33" },
    { icon: <HandCoins />, title: "Customer active in our site", price: "45.5" },
    { icon: <DollarSign />, title: "Anual gross sale in our site", price: "25" },

  ];
  return (
    <>
      <div>
        <div className='grid md:grid-cols-2 gap-10 py-10 px-10 items-center max-w-6xl mx-auto'>

            <div>
                <h1 className='text-4xl mb-8 font-semibold mx-2'>Our Story</h1>
                <p className='text-sm text-gray-900 mb-6'> Launced in 2015, Exclusive is South Asia’s premier online shopping makterplace with an active presense in Bangladesh. Supported by wide range of tailored marketing, data and service solutions, Exclusive has 10,500 sallers and 300 brands and serves 3 millioons customers across the region. </p>
                <p className='text-sm text-gray-900 mt-6'>Exclusive has more than 1 Million products to offer, growing at a very fast. Exclusive offers a diverse assotment in categories ranging  from consumer.</p>
            </div>
            <div>
                <img src={image} alt="" />
            </div>
        </div>
        <div className='flex flex-wrap md:flex-row md:justify-between md: gap-10  py-10 px-10 items-center justify-center max-w-6xl mx-auto'>
            {BrowserCategory.map((category, index) => (
                  <div 
                    key={index} 
                    className=" px-2  "
                  >
                    <div className="flex flex-col items-center gap-2 p-6 border border-gray-300 rounded shadow-sm hover:bg-red-500 group transition-colors hover:border-0">
                      <div className="group-hover:text-black text-white transition-colors bg-black p-3 rounded-full group-hover:bg-white ring-9 ring-black/[0.5] group-hover:ring-white/[0.5] mb-2">{category.icon}</div>
                        <div className='text-2xl font-semibold group-hover:text-white transition-colors'>{category.price}K</div>
                      <div className="text-sm font-medium group-hover:text-white transition-colors">{category.title}</div>
                    </div>
                  </div>
                ))}
        </div>
      </div>
    </>
  )
}

export default AboutHero
