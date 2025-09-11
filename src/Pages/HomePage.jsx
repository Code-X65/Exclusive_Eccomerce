import React from 'react'
import Hero from '../Components/Hero'
import FlashSales from '../Components/FlashSales'
import Category from '../Components/Category'
import BestSelling from '../Components/BestSelling'
import Categories from '../Components/Categories'
import ProductExplore from '../Components/ProductExplore'
import NewArrival from '../Components/NewArrival'
import CompanyFeatures from '../Components/CompanyFeatures'

const HomePage = () => {
  return (
    <div className='bg-gray-50'>
      <Hero />
      <FlashSales />
      <Category />
      <BestSelling />
      <Categories />
  
      <NewArrival />    
      <CompanyFeatures />
    </div>
  )
}

export default HomePage
