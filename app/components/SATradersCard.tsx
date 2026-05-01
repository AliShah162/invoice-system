import { Phone, Mail, Globe, MapPin, Truck } from "lucide-react";
import Image from "next/image";

export default function SATradersCard() {
  return (
    <>
      {/* Main Header - Ultra Compact */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-t-lg shadow-sm p-1.5 text-white print:bg-emerald-600 print:p-0.5">
        <div className="flex items-center justify-between gap-1">
          {/* Left - Truck Logo */}
          <div className="flex-shrink-0">
            <div className="bg-white/20 p-1 rounded-lg">
              <Truck className="w-6 h-6 md:w-8 md:h-8 text-white" />
            </div>
          </div>
          
          {/* Center - Company Info */}
          <div className="flex-1 text-center">
            <h1 className="text-base md:text-xl font-bold print:text-sm">S.A TRADERS</h1>
            <p className="text-emerald-100 text-xs md:text-xs print:text-[8pt]">Distributer | Quice Food Industries</p>
            <div className="flex flex-wrap justify-center gap-1 mt-0.5 text-[10pt] md:text-xs print:text-[7pt]">
              <span>📞 03006443021</span>
              <span>📞 03067317386</span>
            </div>
          </div>
          
          {/* Right - Quice Logo */}
          <div className="flex-shrink-0">
            <div className="bg-white rounded p-0.5 shadow-sm">
              <Image
                src="/quice-logo.png"
                alt="Quice"
                width={35}
                height={35}
                className="object-contain w-7 h-7 md:w-9 md:h-9"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Address Bar - Ultra Compact */}
      <div className="bg-emerald-700 rounded-b-lg shadow-sm px-2 py-1 text-white text-center print:bg-emerald-700 print:py-0.5">
        <div className="flex flex-wrap justify-center gap-x-3 gap-y-0 text-[8pt] md:text-xs print:text-[7pt]">
          <span>📍 Plaza 134 Neelam Commercial, Gujranwala</span>
          <span>✉ omeralvi16@gmail.com</span>
          <span>🌐 quice.com.pk</span>
        </div>
        <div className="text-emerald-200 text-[8pt] print:text-[6pt]">
          Rahwali & Ghakhar
        </div>
      </div>
      
      {/* Sale Invoice Heading - Minimal */}
      <div className="mt-2 text-center print:mt-0">
        <h2 className="text-lg md:text-xl font-bold text-gray-800 border-b-2 border-emerald-500 inline-block pb-0 px-4 print:text-base print:border-b">
          Sale Invoice
        </h2>
      </div>
    </>
  );
}