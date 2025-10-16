import React from 'react'
import Hero from '../Components/Hero'
import FlashSales from '../Components/FlashSales'
import Category from '../Components/Category'
import BestSelling from '../Components/BestSelling'
import Categories from '../Components/Categories'
import ProductExplore from '../Components/ProductExplore'
import NewArrival from '../Components/NewArrival'
import CompanyFeatures from '../Components/CompanyFeatures'
import SmartWatchBanner from '../Components/SmartWatchBanner'
import MobileAppBanner from '../Components/MobileAppBanner'

const HomePage = () => {
  return (
    <div className='bg-gray-900'>
      <Hero />
      <FlashSales />
      <Category />
      <SmartWatchBanner />
      <BestSelling />
      <Categories />
      <NewArrival  />
      <MobileAppBanner />
      <CompanyFeatures />
    </div>
  )
}

export default HomePage
