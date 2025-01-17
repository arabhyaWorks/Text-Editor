// import React, { useState, useCallback, useEffect } from 'react';
// import { Upload, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
// import * as pdfjsLib from 'pdfjs-dist';

// // Initialize PDF.js
// pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

// const ResizableSplitPaneWithPDF = () => {
//   const [isDragging, setIsDragging] = useState(false);
//   const [splitPosition, setSplitPosition] = useState(60);
//   const [pdfFile, setPdfFile] = useState(null);
//   const [pdfDoc, setPdfDoc] = useState(null);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [numPages, setNumPages] = useState(0);
//   const [scale, setScale] = useState(1.0);
//   const canvasRef = React.useRef(null);

//   const handleFileChange = async (event) => {
//     const file = event.target.files?.[0];
//     if (file && file.type === 'application/pdf') {
//       setPdfFile(file);
//       try {
//         const arrayBuffer = await file.arrayBuffer();
//         const loadedPdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
//         setPdfDoc(loadedPdf);
//         setNumPages(loadedPdf.numPages);
//         setCurrentPage(1);
//       } catch (error) {
//         console.error('Error loading PDF:', error);
//       }
//     }
//   };

//   const renderPage = async () => {
//     if (!pdfDoc || !canvasRef.current) return;

//     try {
//       const page = await pdfDoc.getPage(currentPage);
//       const viewport = page.getViewport({ scale });
//       const canvas = canvasRef.current;
//       const context = canvas.getContext('2d');

//       canvas.height = viewport.height;
//       canvas.width = viewport.width;

//       await page.render({
//         canvasContext: context,
//         viewport: viewport
//       }).promise;
//     } catch (error) {
//       console.error('Error rendering page:', error);
//     }
//   };

//   useEffect(() => {
//     renderPage();
//   }, [currentPage, scale, pdfDoc]);

//   const handleMouseDown = (e) => {
//     e.preventDefault();
//     setIsDragging(true);
//   };

//   const handleMouseMove = useCallback((e) => {
//     if (!isDragging) return;
//     const container = e.currentTarget;
//     const containerRect = container.getBoundingClientRect();
//     const newPosition = ((e.clientX - containerRect.left) / containerRect.width) * 100;
//     setSplitPosition(Math.min(Math.max(newPosition, 30), 80));
//   }, [isDragging]);

//   const handleMouseUp = useCallback(() => {
//     setIsDragging(false);
//   }, []);

//   useEffect(() => {
//     if (isDragging) {
//       document.addEventListener('mouseup', handleMouseUp);
//       document.addEventListener('mouseleave', handleMouseUp);
//     } else {
//       document.removeEventListener('mouseup', handleMouseUp);
//       document.removeEventListener('mouseleave', handleMouseUp);
//     }
//     return () => {
//       document.removeEventListener('mouseup', handleMouseUp);
//       document.removeEventListener('mouseleave', handleMouseUp);
//     };
//   }, [isDragging, handleMouseUp]);

//   const renderPDFContent = () => {
//     if (!pdfFile) {
//       return (
//         <div className="h-full w-full flex flex-col items-center justify-center p-8">
//           <Upload size={48} className="text-gray-400 mb-4" />
//           <h3 className="text-lg font-semibold mb-2">Load a PDF</h3>
//           <p className="text-gray-600 text-center mb-4">
//             Select a PDF file from your computer to view it here
//           </p>
//           <label className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors">
//             Choose PDF File
//             <input
//               type="file"
//               accept="application/pdf"
//               onChange={handleFileChange}
//               className="hidden"
//             />
//           </label>
//         </div>
//       );
//     }

//     return (
//       <div className="h-full w-full flex flex-col">
//         <div className="bg-gray-100 p-4 border-b flex items-center justify-between">
//           <div className="flex items-center space-x-4">
//             <button 
//               onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
//               disabled={currentPage <= 1}
//               className="p-2 rounded hover:bg-gray-200 disabled:opacity-50"
//             >
//               <ChevronLeft size={20} />
//             </button>
//             <span className="text-sm">
//               Page {currentPage} of {numPages}
//             </span>
//             <button 
//               onClick={() => setCurrentPage(prev => Math.min(prev + 1, numPages))}
//               disabled={currentPage >= numPages}
//               className="p-2 rounded hover:bg-gray-200 disabled:opacity-50"
//             >
//               <ChevronRight size={20} />
//             </button>
//             <button 
//               onClick={() => setScale(prev => prev + 0.1)}
//               className="p-2 rounded hover:bg-gray-200"
//             >
//               <ZoomIn size={20} />
//             </button>
//             <button 
//               onClick={() => setScale(prev => Math.max(prev - 0.1, 0.1))}
//               className="p-2 rounded hover:bg-gray-200"
//             >
//               <ZoomOut size={20} />
//             </button>
//           </div>
//           <label className="cursor-pointer text-blue-500 hover:text-blue-600 text-sm">
//             Change File
//             <input
//               type="file"
//               accept="application/pdf"
//               onChange={handleFileChange}
//               className="hidden"
//             />
//           </label>
//         </div>
//         <div className="flex-1 overflow-auto bg-gray-50 flex items-center justify-center p-4">
//           <canvas ref={canvasRef} className="shadow-lg" />
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div 
//       className="w-full h-screen flex relative bg-gray-100 select-none"
//       onMouseMove={handleMouseMove}
//     >
//       <div 
//         className="h-full bg-white overflow-hidden"
//         style={{ width: `${splitPosition}%` }}
//       >
//         {renderPDFContent()}
//       </div>

//       <div
//         className="w-1 h-full bg-gray-300 cursor-col-resize hover:bg-blue-400 active:bg-blue-600 transition-colors"
//         onMouseDown={handleMouseDown}
//       />

//       <div 
//         className="h-full bg-white overflow-auto"
//         style={{ width: `${100 - splitPosition}%` }}
//       >
//         <div className="p-4">
//           <h2 className="text-lg font-semibold mb-4">Notes or Additional Content</h2>
//           {pdfFile && (
//             <p className="mb-4">
//               Current file: {pdfFile.name}
//             </p>
//           )}
//           <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
//             <p className="text-blue-700">
//               PDF Controls:
//             </p>
//             <ul className="list-disc pl-5 mt-2 space-y-1 text-blue-700">
//               <li>Use the navigation arrows to move between pages</li>
//               <li>Zoom in/out using the zoom controls</li>
//               <li>Drag the divider to adjust the view size</li>
//             </ul>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ResizableSplitPaneWithPDF;






import React, { useState, useCallback, memo } from 'react';
import { Upload, ZoomIn, ZoomOut } from 'lucide-react';

const PDFHeader = memo(({ fileName }) => (
  <div className="bg-gray-800 text-white py-2 px-4 flex items-center gap-2">
    <span className="text-sm flex-1 truncate">{fileName}</span>
  </div>
));

const PDFControls = memo(({ onFileChange, currentPage, totalPages, onPageChange, onZoomChange }) => (
  <div className="bg-gray-100 border-b flex items-center justify-between px-4 py-2">
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Page</span>
        <input 
          type="number" 
          min="1" 
          max={totalPages || 1}
          value={currentPage}
          onChange={(e) => {
            const page = Math.min(Math.max(1, parseInt(e.target.value) || 1), totalPages || 1);
            onPageChange?.(page);
          }}
          className="w-16 px-2 py-1 border rounded text-center"
        />
        <span className="text-sm text-gray-600">of {totalPages || 1}</span>
      </div>
      <div className="flex items-center gap-2">
        <button 
          className="p-1.5 hover:bg-gray-200 rounded"
          onClick={() => onZoomChange?.('out')}
        >
          <ZoomOut size={18} />
        </button>
        <select 
          className="px-2 py-1 border rounded" 
          onChange={(e) => onZoomChange?.(e.target.value)}
          defaultValue="100"
        >
          <option value="50">50%</option>
          <option value="75">75%</option>
          <option value="100">100%</option>
          <option value="125">125%</option>
          <option value="150">150%</option>
          <option value="200">200%</option>
        </select>
        <button 
          className="p-1.5 hover:bg-gray-200 rounded"
          onClick={() => onZoomChange?.('in')}
        >
          <ZoomIn size={18} />
        </button>
      </div>
    </div>
    <div className="flex items-center gap-2">
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
        onChange={onFileChange}
        className="hidden"
      />
    </div>
  </div>
));

const ResizableSplitPaneWithPDF = () => {
  const [leftWidth, setLeftWidth] = useState(60);
  const [isDragging, setIsDragging] = useState(false);
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfUrl, setPdfUrl] = useState('');
  const [startX, setStartX] = useState(null);
  const [startWidth, setStartWidth] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [zoom, setZoom] = useState(100);
  const iframeRef = React.useRef(null);

  const handleFileChange = useCallback((event) => {
    const file = event.target.files?.[0];
    if (file?.type === 'application/pdf') {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
      setPdfFile(file);
      setPdfUrl(URL.createObjectURL(file));
      setCurrentPage(1);
      setTotalPages(0); // This will be updated when PDF loads
      setZoom(100);
    }
  }, [pdfUrl]);

  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
    setStartX(e.clientX);
    setStartWidth(leftWidth);
  }, [leftWidth]);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging || startX === null || startWidth === null) return;

    const currentX = e.clientX;
    const containerWidth = window.innerWidth;
    const deltaX = currentX - startX;
    const deltaPercentage = (deltaX / containerWidth) * 100;
    const newWidth = Math.min(Math.max(startWidth + deltaPercentage, 20), 80);
    
    setLeftWidth(newWidth);
  }, [isDragging, startX, startWidth]);

  const stopDragging = useCallback(() => {
    setIsDragging(false);
    setStartX(null);
    setStartWidth(null);
  }, []);

  // Global mouse events
  React.useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', stopDragging);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', stopDragging);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, handleMouseMove, stopDragging]);

  React.useEffect(() => {
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
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
        <PDFHeader fileName={pdfFile.name} />
        <PDFControls 
          onFileChange={handleFileChange}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => {
            setCurrentPage(page);
            const iframe = iframeRef.current;
            if (iframe) {
              iframe.src = `${pdfUrl}#page=${page}&zoom=${zoom}&scrollbar=1&view=FitH`;
            }
          }}
          onZoomChange={(value) => {
            let newZoom = zoom;
            if (value === 'in') {
              newZoom = Math.min(zoom + 25, 200);
            } else if (value === 'out') {
              newZoom = Math.max(zoom - 25, 50);
            } else {
              newZoom = parseInt(value);
            }
            setZoom(newZoom);
            const iframe = iframeRef.current;
            if (iframe) {
              iframe.src = `${pdfUrl}#page=${currentPage}&zoom=${newZoom}&scrollbar=1&view=FitH`;
            }
          }}
        />
        <div className="flex-1 relative w-full bg-gray-200 overflow-hidden">
          <div className="absolute inset-0 overflow-auto" style={{ pointerEvents: isDragging ? 'none' : 'auto' }}>
            <iframe
              ref={iframeRef}
              src={`${pdfUrl}#page=${currentPage}&zoom=${zoom}&scrollbar=1&view=FitH`}
              className="w-full h-full border-none bg-white"
              title="PDF Viewer"
              style={{
                minWidth: '100%',
                minHeight: '100%'
              }}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full h-screen flex relative bg-gray-100">
      <div 
        className="h-full bg-white overflow-hidden"
        style={{ width: `${leftWidth}%` }}
      >
        {renderPDFContent()}
      </div>

      <div
        className="w-4 h-full flex-shrink-0 relative cursor-col-resize hover:bg-blue-400 active:bg-blue-600 z-50"
        style={{
          backgroundColor: isDragging ? '#3B82F6' : '#D1D5DB',
          transition: isDragging ? 'none' : 'background-color 0.2s'
        }}
        onMouseDown={handleMouseDown}
      >
        <div className="absolute inset-0" />
      </div>

      <div 
        className="h-full bg-white overflow-auto flex-1"
      >
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-4">Notes or Additional Content</h2>
          {pdfFile && (
            <p className="mb-4 break-words">
              Current file: {pdfFile.name}
            </p>
          )}
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
            <p className="text-blue-700">PDF Controls:</p>
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