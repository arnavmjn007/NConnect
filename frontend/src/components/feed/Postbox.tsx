import { Youtube, Image as ImageIcon, Newspaper } from "lucide-react";

export default function Postbox() {
    return (
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm mb-4">
            <div className="flex gap-2 items-center mb-3">
                <div className="h-12 w-12 bg-gray-200 rounded-full shrink-0" />
                <button className="flex-1 text-left px-4 py-3 border border-gray-300 rounded-full text-gray-500 font-semibold hover:bg-gray-100 transition-all text-sm">
                    Start a post
                </button>
            </div>
            <div className="flex justify-around pt-1">
                <button className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-md transition-colors">
                    <Youtube size={20} className="text-green-600" />
                    <span className="text-sm font-semibold text-gray-500">Video</span>
                </button>
                <button className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-md transition-colors">
                    <ImageIcon size={20} className="text-blue-500" />
                    <span className="text-sm font-semibold text-gray-500">Photo</span>
                </button>
                <button className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-md transition-colors">
                    <Newspaper size={20} className="text-orange-700" />
                    <span className="text-sm font-semibold text-gray-500">Write article</span>
                </button>
            </div>
        </div>
    );
}