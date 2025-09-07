import { Bus, HeadphoneOff, Shield } from 'lucide-react'
import React from 'react'

const CompanyFeatures = () => {
    const features = [
        {
            "icons": <Bus />,
            "title": "Free And Fast Delivery",
            "description": "Free delivery on all orders over $140"
        },
        {
            "icons": <HeadphoneOff />,
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
        <div className='max-w-6xl mx-auto px-4 sm:px-6 my-8 sm:my-10'>
            <div className='flex flex-col sm:flex-row flex-wrap justify-center gap-8 sm:gap-4 md:gap-6 lg:gap-10 items-center mt-6 sm:mt-10'>
                {features.map((feature, index) => {
                    return (
                        <div className='flex flex-col items-center w-full sm:w-[45%] md:w-auto' key={index}>
                            <div className='flex justify-center items-center bg-black text-white rounded-full w-12 h-12 sm:w-14 sm:h-14 ring-8 sm:ring-16 ring-black/[0.1] shadow-lg mb-4 sm:mb-6'>
                                {feature.icons}
                            </div>
                            <div className='text-center text-base sm:text-lg font-bold mt-2 uppercase'>
                                {feature.title}
                            </div>
                            <div className='text-center text-xs sm:text-sm mt-1 sm:mt-2 max-w-[250px]'>
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