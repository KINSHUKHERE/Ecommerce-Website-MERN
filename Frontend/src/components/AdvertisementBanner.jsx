import { useNavigate } from 'react-router-dom'
import { ArrowRight } from "lucide-react";

const AdvertisementBanner = () => {
  const navigate = useNavigate()
  const toHome = () => {
    navigate('/products')
  }
  return (
    <div className='w-full py-16 sm:py-24 flex flex-col justify-center items-center text-center relative overflow-hidden px-6 select-none'>
      
      <div 
        className='absolute inset-0 bg-cover bg-center bg-fixed transition-all duration-500'
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(15, 23, 42, 0.75), rgba(15, 23, 42, 0.85)), url("https://images.unsplash.com/photo-1464537356976-89e35dfa63ee?q=80&w=1332&auto=format&fit=crop")`
        }}
      />

      <div className='relative z-10 flex flex-col justify-center items-center gap-3 text-white'>
        
        <h4 className='text-xs sm:text-sm font-extrabold uppercase tracking-widest text-accent'>
          Limited Time Offers
        </h4>
        
        <h2 className='text-2xl md:text-4xl font-extrabold tracking-tight max-w-3xl leading-snug px-4'>
          Up to <span className='text-red-400 font-black'>70% Off</span> - All Premium Audio & Flagship Mobiles
        </h2>
        
        <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-md mt-1">
          Upgrade your workspace with professional keyboards, mechanical mice, and elite gadgets on instant checkout.
        </p>
        
        <button 
          className='mt-6 text-white bg-gradient-to-r from-primary to-accent hover:opacity-95 text-xs sm:text-sm font-bold px-8 py-3.5 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer active:scale-95 inline-flex items-center gap-2' 
          onClick={toHome}
        >
          Explore Collection
          <ArrowRight size={14} />
        </button>
        
      </div>

    </div>
  )
}

export default AdvertisementBanner