import { Mail, Phone } from 'lucide-react'
import React from 'react'

const ContactPage = () => {
  return (
    <>
      <div className='max-w-6xl mx-auto py-6 md:py-8 lg:py-10 px-4'>
        <div className='flex flex-col lg:flex-row gap-6 md:gap-8 lg:gap-10 items-center justify-center'>
          {/* Contact Info Card */}
          <div className='py-6 md:py-8 px-4 md:px-6 shadow-md font-[400] w-full max-w-[350px] lg:max-w-[270px] rounded-md bg-white'>
            {/* Phone Section */}
            <div className='flex flex-col gap-2 md:gap-3 text-xs pb-4 border-b border-gray-300'>
              <h1 className='font-semibold flex items-center gap-2 text-sm md:text-base'>
                <Phone size={24} className='text-white bg-red-600 p-1 rounded-full' /> 
                Call To US
              </h1>
              <p className='text-xs md:text-sm'>We are available 24/7, days a week</p>
              <p className='text-xs md:text-sm'>Phone: +234 8061936756</p>
            </div>
            
            {/* Email Section */}
            <div className='flex flex-col gap-2 md:gap-3 mt-4 text-xs md:text-sm'>
              <h1 className='flex gap-2 items-center font-semibold text-sm md:text-base'>
                <Mail size={24} className='text-white bg-red-600 p-1 rounded-full' /> 
                Write To US
              </h1>
              <p>Fill out our form and we will contact you within 24 hours</p>
              <p className='hover:underline cursor-pointer'>Email: customer@exclusive.com</p>
              <p className='hover:underline cursor-pointer'>Email: support@exclusive.com</p>
            </div>
          </div>
          
          {/* Contact Form */}
          <div className='w-full max-w-[650px]'>
            <form action="" className='shadow-md rounded-md px-3 md:px-4 py-4 md:py-5'>
              {/* Form Inputs */}
              <div className='flex flex-col md:flex-row gap-3 md:gap-4'>
                <input 
                  type="text" 
                  placeholder='Your Name' 
                  className='bg-gray-50 rounded-sm p-2 w-full mb-3 md:mb-0' 
                  required
                />
                <input 
                  type="email" 
                  placeholder='Your Email' 
                  className='bg-gray-50 rounded-sm p-2 w-full mb-3 md:mb-0' 
                  required
                />
                <input 
                  type="number" 
                  placeholder='Your Phone' 
                  className='bg-gray-50 rounded-sm p-2 w-full' 
                  required 
                />
              </div>
              
              {/* Message Textarea */}
              <textarea 
                placeholder='Your Message' 
                name="message" 
                id="message" 
                className='bg-gray-50 rounded-sm p-2 w-full mt-3 md:mt-4 min-h-[120px] md:min-h-[180px]'
                required
              ></textarea>
              
              {/* Submit Button Container */}
              <div className='flex justify-end mt-3 md:mt-4'>
                <input 
                  type="submit" 
                  value="Send Message" 
                  className='px-4 py-2 bg-red-500 text-white text-xs md:text-sm font-semibold rounded-md cursor-pointer hover:bg-red-600 active:bg-red-700 transition-colors duration-200 shadow-sm'
                />
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}

export default ContactPage