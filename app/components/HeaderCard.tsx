import { Store, Phone, FileText, Hash } from "lucide-react";

export default function HeaderCard() {
  return (
    <div className="bg-white rounded-xl shadow-md p-5 border border-gray-200">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-green-100 p-3 rounded-lg">
            <Store className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">NICE TRADERS</h1>
            <p className="text-gray-500 text-sm">GHAKHAR MANDI</p>
          </div>
        </div>
        
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Phone className="w-4 h-4" />
            <span>0302-6436622</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <FileText className="w-4 h-4" />
            <span>NTN: sdf</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Hash className="w-4 h-4" />
            <span>GST: sdf</span>
          </div>
        </div>
      </div>
    </div>
  );
}