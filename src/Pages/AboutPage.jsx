import React from 'react'
import AboutHero from '../Components/AboutHero'
import TeamMemberSlider from '../Components/TeamMemeber'
import CompanyFeatures from '../Components/CompanyFeatures'

const AboutPage = () => {
  return (
    <>
      <div>
        <div>
            <AboutHero />
            <TeamMemberSlider />
            <CompanyFeatures  />
        </div>
      </div>
    </>
  )
}

export default AboutPage
