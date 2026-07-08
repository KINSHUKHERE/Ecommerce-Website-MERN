import React from "react";

const festivalStickers = {
  diwali: [
    { emoji: "🪔", top: "8%", left: "3%", size: "text-4xl", anim: "anim-floatUpDown" },
    { emoji: "✨", top: "14%", right: "4%", size: "text-3xl", anim: "anim-floatLeftRight" },
    { emoji: "🎆", top: "20%", left: "5%", size: "text-5xl", anim: "anim-floatDiagonalUp" },
    { emoji: "🍬", top: "26%", right: "3%", size: "text-4xl", anim: "anim-floatDiagonalDown" },
    { emoji: "🎇", top: "32%", left: "4%", size: "text-4xl", anim: "anim-floatUpDown" },
    { emoji: "🪔", top: "38%", right: "6%", size: "text-4xl", anim: "anim-floatLeftRight" },
    { emoji: "🍬", top: "44%", left: "3%", size: "text-3xl", anim: "anim-floatDiagonalUp" },
    { emoji: "🌸", top: "50%", right: "5%", size: "text-4xl", anim: "anim-floatDiagonalDown" },
    { emoji: "🪔", top: "56%", left: "4%", size: "text-4xl", anim: "anim-floatUpDown" },
    { emoji: "✨", top: "62%", right: "3%", size: "text-3xl", anim: "anim-floatLeftRight" },
    { emoji: "🎆", top: "68%", left: "6%", size: "text-5xl", anim: "anim-floatDiagonalUp" },
    { emoji: "🍬", top: "74%", right: "4%", size: "text-4xl", anim: "anim-floatDiagonalDown" },
    { emoji: "🎇", top: "80%", left: "3%", size: "text-4xl", anim: "anim-floatUpDown" },
    { emoji: "🪔", top: "86%", right: "5%", size: "text-4xl", anim: "anim-floatLeftRight" },
    { emoji: "🌸", top: "92%", left: "5%", size: "text-4xl", anim: "anim-floatDiagonalUp" },
    { emoji: "🍬", top: "96%", right: "4%", size: "text-3xl", anim: "anim-floatDiagonalDown" }
  ],
  holi: [
    { emoji: "🎨", top: "8%", left: "3%", size: "text-4xl", anim: "anim-floatUpDown" },
    { emoji: "🔫", top: "14%", right: "4%", size: "text-5xl", anim: "anim-floatLeftRight" },
    { emoji: "💦", top: "20%", left: "5%", size: "text-4xl", anim: "anim-floatDiagonalUp" },
    { emoji: "🏺", top: "26%", right: "3%", size: "text-4xl", anim: "anim-floatDiagonalDown" },
    { emoji: "🌈", top: "32%", left: "4%", size: "text-4xl", anim: "anim-floatUpDown" },
    { emoji: "🎨", top: "38%", right: "6%", size: "text-4xl", anim: "anim-floatLeftRight" },
    { emoji: "🍬", top: "44%", left: "3%", size: "text-3xl", anim: "anim-floatDiagonalUp" },
    { emoji: "💦", top: "50%", right: "5%", size: "text-4xl", anim: "anim-floatDiagonalDown" },
    { emoji: "🏺", top: "56%", left: "4%", size: "text-4xl", anim: "anim-floatUpDown" },
    { emoji: "🌈", top: "62%", right: "3%", size: "text-4xl", anim: "anim-floatLeftRight" },
    { emoji: "🎨", top: "68%", left: "6%", size: "text-4xl", anim: "anim-floatDiagonalUp" },
    { emoji: "🔫", top: "74%", right: "4%", size: "text-5xl", anim: "anim-floatDiagonalDown" },
    { emoji: "💦", top: "80%", left: "3%", size: "text-4xl", anim: "anim-floatUpDown" },
    { emoji: "🏺", top: "86%", right: "5%", size: "text-4xl", anim: "anim-floatLeftRight" },
    { emoji: "🌈", top: "92%", left: "5%", size: "text-4xl", anim: "anim-floatDiagonalUp" },
    { emoji: "🎨", top: "96%", right: "4%", size: "text-4xl", anim: "anim-floatDiagonalDown" }
  ],
  christmas: [
    { emoji: "🎄", top: "8%", left: "3%", size: "text-4xl", anim: "anim-floatUpDown" },
    { emoji: "🎁", top: "14%", right: "4%", size: "text-4xl", anim: "anim-floatLeftRight" },
    { emoji: "🔔", top: "20%", left: "5%", size: "text-3xl", anim: "anim-floatDiagonalUp" },
    { emoji: "❄️", top: "26%", right: "3%", size: "text-4xl", anim: "anim-floatDiagonalDown" },
    { emoji: "🍭", top: "32%", left: "4%", size: "text-3xl", anim: "anim-floatUpDown" },
    { emoji: "🌟", top: "38%", right: "6%", size: "text-4xl", anim: "anim-floatLeftRight" },
    { emoji: "🎄", top: "44%", left: "3%", size: "text-4xl", anim: "anim-floatDiagonalUp" },
    { emoji: "🔔", top: "50%", right: "5%", size: "text-3xl", anim: "anim-floatDiagonalDown" },
    { emoji: "🎁", top: "56%", left: "4%", size: "text-4xl", anim: "anim-floatUpDown" },
    { emoji: "❄️", top: "62%", right: "3%", size: "text-4xl", anim: "anim-floatLeftRight" },
    { emoji: "🍭", top: "68%", left: "6%", size: "text-3xl", anim: "anim-floatDiagonalUp" },
    { emoji: "🌟", top: "74%", right: "4%", size: "text-4xl", anim: "anim-floatDiagonalDown" },
    { emoji: "🎄", top: "80%", left: "3%", size: "text-4xl", anim: "anim-floatUpDown" },
    { emoji: "🎁", top: "86%", right: "5%", size: "text-4xl", anim: "anim-floatLeftRight" },
    { emoji: "🔔", top: "92%", left: "5%", size: "text-3xl", anim: "anim-floatDiagonalUp" },
    { emoji: "❄️", top: "96%", right: "4%", size: "text-4xl", anim: "anim-floatDiagonalDown" }
  ],
  winter: [
    { emoji: "❄️", top: "8%", left: "3%", size: "text-4xl", anim: "anim-floatUpDown" },
    { emoji: "🌲", top: "14%", right: "4%", size: "text-4xl", anim: "anim-floatLeftRight" },
    { emoji: "⛄", top: "20%", left: "5%", size: "text-4xl", anim: "anim-floatDiagonalUp" },
    { emoji: "🏔️", top: "26%", right: "3%", size: "text-4xl", anim: "anim-floatDiagonalDown" },
    { emoji: "🧣", top: "32%", left: "4%", size: "text-3xl", anim: "anim-floatUpDown" },
    { emoji: "❄️", top: "38%", right: "6%", size: "text-4xl", anim: "anim-floatLeftRight" },
    { emoji: "🧤", top: "44%", left: "3%", size: "text-3xl", anim: "anim-floatDiagonalUp" },
    { emoji: "⛄", top: "50%", right: "5%", size: "text-4xl", anim: "anim-floatDiagonalDown" },
    { emoji: "🌲", top: "56%", left: "4%", size: "text-4xl", anim: "anim-floatUpDown" },
    { emoji: "🏔️", top: "62%", right: "3%", size: "text-4xl", anim: "anim-floatLeftRight" },
    { emoji: "🧣", top: "68%", left: "6%", size: "text-3xl", anim: "anim-floatDiagonalUp" },
    { emoji: "❄️", top: "74%", right: "4%", size: "text-4xl", anim: "anim-floatDiagonalDown" },
    { emoji: "🧤", top: "80%", left: "3%", size: "text-3xl", anim: "anim-floatUpDown" },
    { emoji: "⛄", top: "86%", right: "5%", size: "text-4xl", anim: "anim-floatLeftRight" },
    { emoji: "🌲", top: "92%", left: "5%", size: "text-4xl", anim: "anim-floatDiagonalUp" },
    { emoji: "❄️", top: "96%", right: "4%", size: "text-4xl", anim: "anim-floatDiagonalDown" }
  ],
  summer: [
    { emoji: "🌴", top: "8%", left: "3%", size: "text-4xl", anim: "anim-floatUpDown" },
    { emoji: "☀️", top: "14%", right: "4%", size: "text-4xl", anim: "anim-floatLeftRight" },
    { emoji: "🕶️", top: "20%", left: "5%", size: "text-3xl", anim: "anim-floatDiagonalUp" },
    { emoji: "🍹", top: "26%", right: "3%", size: "text-4xl", anim: "anim-floatDiagonalDown" },
    { emoji: "🍉", top: "32%", left: "4%", size: "text-4xl", anim: "anim-floatUpDown" },
    { emoji: "🌴", top: "38%", right: "6%", size: "text-4xl", anim: "anim-floatLeftRight" },
    { emoji: "🏖️", top: "44%", left: "3%", size: "text-4xl", anim: "anim-floatDiagonalUp" },
    { emoji: "🍹", top: "50%", right: "5%", size: "text-4xl", anim: "anim-floatDiagonalDown" },
    { emoji: "☀️", top: "56%", left: "4%", size: "text-4xl", anim: "anim-floatUpDown" },
    { emoji: "🕶️", top: "62%", right: "3%", size: "text-3xl", anim: "anim-floatLeftRight" },
    { emoji: "🍉", top: "68%", left: "6%", size: "text-4xl", anim: "anim-floatDiagonalUp" },
    { emoji: "🌴", top: "74%", right: "4%", size: "text-4xl", anim: "anim-floatDiagonalDown" },
    { emoji: "🏖️", top: "80%", left: "3%", size: "text-4xl", anim: "anim-floatUpDown" },
    { emoji: "🍹", top: "86%", right: "5%", size: "text-4xl", anim: "anim-floatLeftRight" },
    { emoji: "🌴", top: "92%", left: "5%", size: "text-4xl", anim: "anim-floatDiagonalUp" },
    { emoji: "☀️", top: "96%", right: "4%", size: "text-4xl", anim: "anim-floatDiagonalDown" }
  ],
  yocart: [
    { emoji: "💎", top: "8%", left: "3%", size: "text-4xl", anim: "anim-floatUpDown" },
    { emoji: "⚡", top: "14%", right: "4%", size: "text-3xl", anim: "anim-floatLeftRight" },
    { emoji: "🛍️", top: "20%", left: "5%", size: "text-4xl", anim: "anim-floatDiagonalUp" },
    { emoji: "🎁", top: "26%", right: "3%", size: "text-4xl", anim: "anim-floatDiagonalDown" },
    { emoji: "🛒", top: "32%", left: "4%", size: "text-3xl", anim: "anim-floatUpDown" },
    { emoji: "💎", top: "38%", right: "6%", size: "text-4xl", anim: "anim-floatLeftRight" },
    { emoji: "✨", top: "44%", left: "3%", size: "text-4xl", anim: "anim-floatDiagonalUp" },
    { emoji: "⚡", top: "50%", right: "5%", size: "text-3xl", anim: "anim-floatDiagonalDown" },
    { emoji: "🛍️", top: "56%", left: "4%", size: "text-4xl", anim: "anim-floatUpDown" },
    { emoji: "🎁", top: "62%", right: "3%", size: "text-4xl", anim: "anim-floatLeftRight" },
    { emoji: "🛒", top: "68%", left: "6%", size: "text-3xl", anim: "anim-floatDiagonalUp" },
    { emoji: "💎", top: "74%", right: "4%", size: "text-4xl", anim: "anim-floatDiagonalDown" },
    { emoji: "✨", top: "80%", left: "3%", size: "text-4xl", anim: "anim-floatUpDown" },
    { emoji: "⚡", top: "86%", right: "5%", size: "text-3xl", anim: "anim-floatLeftRight" },
    { emoji: "🛍️", top: "92%", left: "5%", size: "text-4xl", anim: "anim-floatDiagonalUp" },
    { emoji: "🎁", top: "96%", right: "4%", size: "text-4xl", anim: "anim-floatDiagonalDown" }
  ]
};

const FloatingStickers = ({ theme }) => {
  const stickers = festivalStickers[theme] || [];
  if (stickers.length === 0) return null;

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none select-none overflow-hidden z-0">
      {/* Dynamic Keyframes Injector */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes floatUpDown {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-25px) rotate(10deg); }
        }
        @keyframes floatLeftRight {
          0%, 100% { transform: translateX(0px) rotate(0deg); }
          50% { transform: translateX(25px) rotate(-12deg); }
        }
        @keyframes floatDiagonalUp {
          0%, 100% { transform: translate(0px, 0px) rotate(0deg); }
          50% { transform: translate(20px, -20px) rotate(8deg); }
        }
        @keyframes floatDiagonalDown {
          0%, 100% { transform: translate(0px, 0px) rotate(0deg); }
          50% { transform: translate(-20px, 20px) rotate(-8deg); }
        }
        .anim-floatUpDown {
          animation: floatUpDown 6s ease-in-out infinite;
        }
        .anim-floatLeftRight {
          animation: floatLeftRight 7s ease-in-out infinite;
        }
        .anim-floatDiagonalUp {
          animation: floatDiagonalUp 8s ease-in-out infinite;
        }
        .anim-floatDiagonalDown {
          animation: floatDiagonalDown 6.5s ease-in-out infinite;
        }
      `}} />

      {stickers.map((sticker, idx) => {
        const sideStyle = sticker.left
          ? { left: sticker.left }
          : { right: sticker.right };

        return (
          <span
            key={idx}
            className={`absolute ${sticker.size} opacity-[0.14] hover:opacity-[0.3] transition-all duration-700 ${sticker.anim}`}
            style={{
              top: sticker.top,
              ...sideStyle,
              animationDelay: `${idx * 0.4}s`
            }}
          >
            {sticker.emoji}
          </span>
        );
      })}
    </div>
  );
};

export default FloatingStickers;
