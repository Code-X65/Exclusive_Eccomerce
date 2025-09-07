import { useEffect, useState, useRef } from 'react';
import { gsap } from 'gsap';
import team01 from '../assets/Images/Teams/TomCruis.png'
import team02 from '../assets/Images/Teams/WillSmith.png'
import team03 from '../assets/Images/EmmaWatson.png'

const TeamMemberSlider = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [slidesToShow, setSlidesToShow] = useState(3);
  const [totalSlides, setTotalSlides] = useState(0);
  const dotsRef = useRef(null);
  const slidesRef = useRef(null);
  const timelineRef = useRef(null);
  const containerRef = useRef(null);

  const teamMembers = [
    {
      name: "Tom Cruise",
      title: "Founder & Chairman",
      socialLinks: ["twitter", "instagram", "linkedin"],
      image: team01,
    },
    {
      name: "Emma Watson",
      title: "Managing Director",
      socialLinks: ["twitter", "instagram", "linkedin"],
      image: team02,
    },
    {
      name: "Will Smith",
      title: "Product Designer",
      socialLinks: ["twitter", "instagram", "linkedin"],
      image: team03
    },
    {
      name: "Jane Doe",
      title: "Marketing Director",
      socialLinks: ["twitter", "instagram", "linkedin"],
      image: "https://img.freepik.com/premium-photo/happy-woman-blazer-transparent-png_53876-996198.jpg?uid=R193842198&ga=GA1.1.1758055807.1746272145&semt=ais_hybrid&w=740"
    },
    {
      name: "John Smith",
      title: "Lead Developer",
      socialLinks: ["twitter", "instagram", "linkedin"],
      image: "https://img.freepik.com/premium-photo/smiling-professional-business-woman-her-business-office-isolated-background-ai-generated_1145931-13628.jpg?uid=R193842198&ga=GA1.1.1758055807.1746272145&semt=ais_hybrid&w=740"
    }
  ];

  // Handle responsive slidesToShow
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSlidesToShow(3); // Desktop: 3 slides
      } else if (window.innerWidth >= 640) {
        setSlidesToShow(2); // Tablet: 2 slides
      } else {
        setSlidesToShow(1); // Mobile: 1 slide
      }
    };

    // Initialize
    handleResize();
    
    // Calculate total number of possible scroll positions
    setTotalSlides(Math.max(1, teamMembers.length - slidesToShow + 1));
    
    // Add resize listener
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [teamMembers.length, slidesToShow]);

  // Update total slides when slidesToShow changes
  useEffect(() => {
    setTotalSlides(Math.max(1, teamMembers.length - slidesToShow + 1));
    
    // If current slide is now invalid, adjust it
    if (activeSlide >= teamMembers.length - slidesToShow + 1) {
      setActiveSlide(Math.max(0, teamMembers.length - slidesToShow));
    }
  }, [slidesToShow, teamMembers.length, activeSlide]);

  useEffect(() => {
    // Initialize GSAP timeline
    timelineRef.current = gsap.timeline();
    
    // Animation for active dot
    const updateDots = () => {
      if (dotsRef.current) {
        const dots = dotsRef.current.children;
        gsap.to(dots, {
          scale: 1,
          opacity: 0.5,
          duration: 0.3,
          ease: "power2.out"
        });
        
        if (dots[activeSlide]) {
          gsap.to(dots[activeSlide], {
            scale: 1.5,
            opacity: 1,
            duration: 0.3,
            ease: "back.out"
          });
        }
      }
    };
    
    // Animation for slides
    const updateSlides = () => {
      if (slidesRef.current && containerRef.current) {
        const slideWidth = containerRef.current.offsetWidth / slidesToShow;
        
        gsap.to(slidesRef.current, {
          x: -activeSlide * slideWidth,
          duration: 0.5,
          ease: "power2.inOut"
        });
      }
    };
    
    updateDots();
    updateSlides();
  }, [activeSlide, slidesToShow]);

  const handleDotClick = (index) => {
    setActiveSlide(index);
  };

  const handleNextSlide = () => {
    setActiveSlide((prev) => Math.min(prev + 1, totalSlides - 1));
  };

  const handlePrevSlide = () => {
    setActiveSlide((prev) => Math.max(prev - 1, 0));
  };

  const SocialIcon = ({ type }) => {
    if (type === "twitter") {
      return (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
        </svg>
      );
    } else if (type === "instagram") {
      return (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      );
    } else if (type === "linkedin") {
      return (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h-.003z"/>
        </svg>
      );
    }
    return null;
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      <div className="relative overflow-hidden" ref={containerRef}>
        <div 
          ref={slidesRef}
          className="flex flex-nowrap"
          style={{ width: `${(100 * teamMembers.length) / slidesToShow}%` }}
        >
          {teamMembers.map((member, index) => (
            <div 
              key={index} 
              className="px-2"
              style={{ width: `${100 / teamMembers.length}%` }}
            >
              <div className="flex flex-col items-center">
                <div className="bg-gray-100 w-full flex items-center justify-center">
                  <img 
                    src={member.image} 
                    alt={member.name} 
                    className="w-full h-full md:h-72 lg:h-80 object-cover object-center pt-2 "
                  />
                </div>
                <div className="text-center p-4">
                  <h3 className="text-lg md:text-xl font-bold">{member.name}</h3>
                  <p className="text-gray-600 text-sm md:text-base">{member.title}</p>
                  <div className="flex space-x-4 mt-3 justify-center">
                    {member.socialLinks.map((social, idx) => (
                      <a key={idx} href="#" className="text-gray-500 hover:text-red-500">
                        <SocialIcon type={social} />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Navigation Controls */}
        <div className="flex justify-between absolute top-1/2 left-0 right-0 transform -translate-y-1/2 px-2">
          <button
            onClick={handlePrevSlide}
            disabled={activeSlide === 0}
            className={`z-10 rounded-full bg-white shadow-md p-2 focus:outline-none ${
              activeSlide === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'
            }`}
            aria-label="Previous slide"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button
            onClick={handleNextSlide}
            disabled={activeSlide >= totalSlides - 1}
            className={`z-10 rounded-full bg-white shadow-md p-2 focus:outline-none ${
              activeSlide >= totalSlides - 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100' 
            }`}
            aria-label="Next slide"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        
        <div 
          ref={dotsRef}
          className="flex justify-center space-x-2 mt-8"
        >
          {Array.from({ length: totalSlides }).map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full ${
                index === activeSlide ? 'bg-red-500' : 'bg-gray-300'
              }`}
              onClick={() => handleDotClick(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TeamMemberSlider;