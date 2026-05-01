import { Building2, Phone, Mail, Globe, MapPin } from "lucide-react";

export default function CompanyCard() {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl shadow-lg p-5 text-white">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <Building2 className="w-8 h-8" />
          <div>
            <h2 className="text-2xl font-bold">M.Omer Zeshan Alvi</h2>
            <p className="text-blue-100">Hafiz M Sheheryaar Alvi</p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4" />
            <span>03006443021</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4" />
            <span>03067317386</span>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-blue-500 flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4" />
          <span className="font-semibold">S.A TRADERS</span>
        </div>
        <div className="flex items-center gap-2">
          <span>Distributer | Quice Food Industries</span>
        </div>
        <div className="flex items-center gap-2">
          <span>Rahwali & Ghakhar</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          <span>Plaza 134 Neelam Commercial, Block Dc Colony Gujranwala</span>
        </div>
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4" />
          <span>omeralvi16@gmail.com</span>
        </div>
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4" />
          <span>www.quice.com.pk</span>
        </div>
      </div>
    </div>
  );
}