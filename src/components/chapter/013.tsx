import React from "react";
import {
  Flame,
  Circle,
  Wheat,
  PenTool,
  Printer,
  Wind,
  Zap,
  Phone,
  Monitor,
  Globe,
  Smartphone,
  Brain,
} from "lucide-react";

const icons = [
  { name: "Fire", Icon: Flame },
  { name: "Wheel", Icon: Circle },
  { name: "Agriculture", Icon: Wheat },
  { name: "Writing", Icon: PenTool },
  { name: "Printing", Icon: Printer },
  { name: "Steam", Icon: Wind },
  { name: "Electricity", Icon: Zap },
  { name: "Telephone", Icon: Phone },
  { name: "Computer", Icon: Monitor },
  { name: "Internet", Icon: Globe },
  { name: "Mobile", Icon: Smartphone },
  { name: "AI", Icon: Brain },
];

const TechnologyIconsGrid = () => {
  return (
    <div className="grid grid-cols-6 gap-4">
      {icons.map((item, index) => (
        <div
          key={item.name}
          className="flex flex-col items-center animate-pop"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center 
            ${index === icons.length - 1 ? "bg-lime-300" : "bg-gray-200"}
            transition-transform hover:scale-110 duration-300 ease-in-out`}
          >
            <item.Icon className="w-8 h-8" />
          </div>
          <span className="mt-2 text-sm text-center">{item.name}</span>
        </div>
      ))}
    </div>
  );
};

const PopAnimation = () => (
  <style jsx global>{`
    @keyframes pop {
      0% {
        transform: scale(0);
        opacity: 0;
      }
      80% {
        transform: scale(1.1);
      }
      100% {
        transform: scale(1);
        opacity: 1;
      }
    }
    .animate-pop {
      animation: pop 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
      opacity: 0;
    }
  `}</style>
);

const AnimatedTechnologyIconsGrid = () => (
  <>
    <PopAnimation />
    <TechnologyIconsGrid />
  </>
);

export default AnimatedTechnologyIconsGrid;
