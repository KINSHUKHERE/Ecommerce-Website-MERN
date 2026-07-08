export const themes = {
  normal: {
    name: "Default",
    bgClass: "bg-transparent",
    bannerGradient: "from-red-600 via-orange-500 to-amber-500",
    accentColor: "text-primary",
    badgeBg: "bg-red-500",
    heroGradient: "from-[#088178] to-[#15877F]",
    heroText: "text-white",
    description: "Standard clean minimal store mode.",
    illustrations: []
  },
  diwali: {
    name: "Diwali",
    bgClass: "bg-gradient-to-b from-amber-50/30 via-orange-50/5 to-amber-100/10",
    bannerGradient: "from-orange-600 via-amber-500 to-yellow-500",
    accentColor: "text-amber-600",
    badgeBg: "bg-amber-600",
    heroGradient: "from-orange-655 via-amber-600 to-purple-900",
    heroText: "text-amber-50",
    description: "Transform your home shopping experience with ivory, warm golden gradients, Rangoli motifs, floating lamps, and torans.",
    illustrations: ["🪔", "✨", "🌸"]
  },
  holi: {
    name: "Holi",
    bgClass: "bg-gradient-to-b from-pink-50/20 via-purple-50/5 to-emerald-50/15",
    bannerGradient: "from-pink-500 via-purple-500 to-emerald-400",
    accentColor: "text-pink-500",
    badgeBg: "bg-pink-500",
    heroGradient: "from-pink-500 via-yellow-400 to-purple-600",
    heroText: "text-pink-50",
    description: "Vibrant paint splashes, clouds of colorful gulal powder, water droplets, and playful watercolor highlights.",
    illustrations: ["🌈", "🎨", "💦"]
  },
  christmas: {
    name: "Christmas",
    bgClass: "bg-gradient-to-b from-red-50/10 via-green-50/5 to-emerald-50/10",
    bannerGradient: "from-red-700 via-emerald-750 to-green-600",
    accentColor: "text-red-600",
    badgeBg: "bg-red-600",
    heroGradient: "from-red-700 via-emerald-800 to-zinc-900",
    heroText: "text-red-50",
    description: "Luxurious snowy patterns, cozy hanging ornaments, wrapped gifts, candy canes, wreaths, and fairy lights.",
    illustrations: ["🎄", "🎁", "🔔"]
  },
  winter: {
    name: "Winter",
    bgClass: "bg-gradient-to-b from-cyan-50/15 via-white to-blue-50/10",
    bannerGradient: "from-blue-600 via-cyan-500 to-sky-400",
    accentColor: "text-blue-600",
    badgeBg: "bg-blue-600",
    heroGradient: "from-blue-800 via-cyan-700 to-sky-600",
    heroText: "text-blue-50",
    description: "Icy blue gradients, frozen crystalline mist, winter pine trees, frosted glass textures, and minimal layout lines.",
    illustrations: ["❄️", "🏔️", "🌲"]
  },
  summer: {
    name: "Summer",
    bgClass: "bg-gradient-to-b from-sky-50/25 via-yellow-50/5 to-amber-50/15",
    bannerGradient: "from-yellow-400 via-orange-400 to-amber-500",
    accentColor: "text-orange-500",
    badgeBg: "bg-orange-500",
    heroGradient: "from-cyan-500 via-coral-400 to-orange-400",
    heroText: "text-orange-50",
    description: "Sun-drenched cream tones, tropical palm leaves, sunglasses, surfboards, citrus slices, and crystal clear water splashes.",
    illustrations: ["☀️", "🌴", "🕶️"]
  },
  yocart: {
    name: "YoCart Special",
    bgClass: "bg-gradient-to-b from-violet-50/20 via-white to-indigo-50/15",
    bannerGradient: "from-violet-650 via-fuchsia-600 to-indigo-650",
    accentColor: "text-violet-600",
    badgeBg: "bg-violet-600",
    heroGradient: "from-slate-950 via-indigo-950 to-violet-950 border border-violet-500/20",
    heroText: "text-violet-50",
    description: "Exclusive brand theme featuring futuristic teal & neon glow elements, gift boxes, holographic waves, and Stripe/Shopify-style high-end grids.",
    illustrations: ["💎", "⚡", "🎁"]
  }
};

export const getThemeConfig = (themeKey) => {
  return themes[themeKey] || themes.normal;
};
