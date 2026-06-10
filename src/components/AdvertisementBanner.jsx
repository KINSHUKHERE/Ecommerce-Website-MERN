import React from 'react'
import { useNavigate } from 'react-router-dom'

const AdvertisementBanner = () => {
  const navigate = useNavigate()
  const toHome= ()=>{
    navigate('/products')
  }
  return (
    <div className='w-full h-72 flex flex-col justify-center items-center text-center gap-4 relative overflow-hidden px-4 select-none'>
      
      <div 
        className='absolute inset-0 bg-cover bg-center bg-fixed transition-all duration-500'
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.65)), url("https://images.unsplash.com/photo-1464537356976-89e35dfa63ee?q=80&w=1332&auto=format&fit=crop")`
        }}
      />

      <div className='relative z-10 flex flex-col justify-center items-center gap-3 text-white drop-shadow-md'>
        
        <h4 className='text-base font-semibold uppercase tracking-widest text-gray-300'>
          Repair Services
        </h4>
        
        <h2 className='text-2xl md:text-4xl font-extrabold tracking-tight max-w-3xl leading-snug px-2'>
          Up to <span className='text-[#ff3902] font-black'>70% Off</span> - All HeadPhones & Other Accessories
        </h2>
        
        <button className='mt-3 text-white bg-transparent border-2 border-white text-sm font-bold px-8 py-3 rounded-md hover:bg-[#088178] hover:border-[#088178] transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer shadow-md' onClick={toHome}>
          Explore More
        </button>
        
      </div>

    </div>
  )
}

export default AdvertisementBanner