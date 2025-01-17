import React from 'react';
import { 
  FileText, 
  Edit, 
  Trash2, 
  Save,
  MessageSquare,
  Keyboard,
  Cloud,
  CloudOff,
  Clock,
  User
} from 'lucide-react';

const DocumentHeader = () => {
  const [isSynced, setIsSynced] = React.useState(true);

  return (
    <header className="bg-gradient-to-b from-white to-gray-50 border-b border-gray-200 shadow-sm">
      <div className="max-w-[1920px] mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl shadow-lg shadow-blue-100 transform transition-transform hover:scale-105">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-3">
                  <h1 className="text-xl font-semibold text-gray-800 hover:text-blue-600 transition-colors">
                    Document Title
                  </h1>
                  {isSynced ? (
                    <div className="flex items-center text-green-600 bg-green-50 px-2 py-0.5 rounded-full text-xs font-medium animate-pulse">
                      <Cloud className="w-3 h-3 mr-1" />
                      <span>Synced</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full text-xs font-medium">
                      <CloudOff className="w-3 h-3 mr-1" />
                      <span>Not synced</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center mt-1.5 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1.5 text-blue-500" />
                    <span className="font-medium text-gray-600">Assigned 2 days ago</span>
                  </div>
                  <div className="mx-3 h-1 w-1 rounded-full bg-gray-300"></div>
                  <div className="flex items-center group">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                      <User className="w-3 h-3 text-white" />
                    </div>
                    <span className="ml-1.5 text-gray-600 group-hover:text-blue-600 transition-colors">
                      Ajay Singh Rajawat
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
              title="Keyboard Shortcuts (Ctrl + /)"
            >
              <Keyboard className="w-4 h-4 text-gray-500" />
            </button>
            <button 
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
              title="Comments"
            >
              <MessageSquare className="w-4 h-4 text-gray-500" />
              <span className="ml-1.5 bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-xs font-semibold">3</span>
            </button>
            <button 
              className="flex items-center px-4 py-2 text-sm font-medium text-green-600 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 hover:border-green-300 transition-all shadow-sm"
              title="Save Changes (Ctrl + S)"
            >
              <Save className="w-4 h-4 mr-2" />
              Save
            </button>
            <button 
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm"
              title="Edit Document"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </button>
            <button 
              className="flex items-center px-3 py-2 text-sm font-medium text-red-600 bg-white border border-gray-200 rounded-lg hover:bg-red-50 hover:border-red-200 transition-all shadow-sm group"
              title="Discard Changes"
            >
              <Trash2 className="w-4 h-4 group-hover:text-red-500 transition-colors" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default DocumentHeader;