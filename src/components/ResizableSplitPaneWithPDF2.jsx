import React, { useState, useCallback } from 'react';
import { Upload, ZoomIn, ZoomOut, Download, Printer, MoreVertical } from 'lucide-react';

const ResizableSplitPaneWithPDF = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [splitPosition, setSplitPosition] = useState(60);
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfUrl, setPdfUrl] = useState('');
  const [totalPages, setTotalPages] = useState(0);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
      const url = URL.createObjectURL(file);
      setPdfUrl(url);
      // In a real implementation, we would get the total pages from the PDF
      setTotalPages(194); // Example value
    }
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    const container = e.currentTarget;
    const containerRect = container.getBoundingClientRect();
    const newPosition = ((e.clientX - containerRect.left) / containerRect.width) * 100;
    setSplitPosition(Math.min(Math.max(newPosition, 20), 80));
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('mouseleave', handleMouseUp);
    } else {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseUp);
    };
  }, [isDragging, handleMouseUp]);

  React.useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  const renderPDFContent = () => {
    if (!pdfFile) {
      return (
        <div className="h-full w-full flex flex-col items-center justify-center p-8">
          <Upload size={48} className="text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Load a PDF</h3>
          <p className="text-gray-600 text-center mb-4">
            Select a PDF file from your computer to view it here
          </p>
          <label className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors">
            Choose PDF File
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>
      );
    }

    return (
      <div className="h-full w-full flex flex-col">
        {/* PDF Viewer Header */}
        <div className="bg-gray-800 text-white py-2 px-4 flex items-center gap-2">
          <span className="text-sm flex-1 truncate">{pdfFile.name}</span>
        </div>
        
        {/* Controls Bar */}
        <div className="bg-gray-100 border-b flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Page</span>
              <input 
                type="number" 
                min="1" 
                max={totalPages}
                className="w-16 px-2 py-1 border rounded"
                value="1"
              />
              <span className="text-sm text-gray-600">of {totalPages}</span>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-1.5 hover:bg-gray-200 rounded">
                <ZoomOut size={18} />
              </button>
              <select className="px-2 py-1 border rounded">
                <option>100%</option>
                <option>125%</option>
                <option>150%</option>
                <option>200%</option>
              </select>
              <button className="p-1.5 hover:bg-gray-200 rounded">
                <ZoomIn size={18} />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-1.5 hover:bg-gray-200 rounded">
              <Download size={18} />
            </button>
            <button className="p-1.5 hover:bg-gray-200 rounded">
              <Printer size={18} />
            </button>
            <button className="p-1.5 hover:bg-gray-200 rounded">
              <MoreVertical size={18} />
            </button>
            <button 
              className="text-blue-500 hover:text-blue-600 text-sm"
              onClick={() => document.getElementById('fileInput').click()}
            >
              Change File
            </button>
            <input
              id="fileInput"
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>

        {/* PDF Content */}
        <div className="flex-1 relative w-full bg-gray-200">
          <iframe
            src={`${pdfUrl}#toolbar=0`}
            className="absolute inset-0 w-full h-full border-none"
            title="PDF Viewer"
          />
        </div>
      </div>
    );
  };

  return (
    <div 
      className="w-full h-screen flex relative bg-gray-100 select-none overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      <div 
        className="h-full bg-white overflow-hidden"
        style={{ 
          width: `${splitPosition}%`,
          minWidth: '200px',
          maxWidth: '80%'
        }}
      >
        {renderPDFContent()}
      </div>

      <div
        className="w-1 h-full bg-gray-300 cursor-col-resize hover:bg-blue-400 active:bg-blue-600 transition-colors"
        onMouseDown={handleMouseDown}
      />

      <div 
        className="h-full bg-white overflow-auto"
        style={{ width: `${100 - splitPosition}%` }}
      >
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-4">Notes or Additional Content</h2>
          {pdfFile && (
            <p className="mb-4 break-words">
              Current file: {pdfFile.name}
            </p>
          )}
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
            <p className="text-blue-700">
              PDF Controls:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-blue-700">
              <li>Scroll to view all pages</li>
              <li>Use zoom controls to adjust view size</li>
              <li>Drag the divider to adjust the panel width</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResizableSplitPaneWithPDF;
