import React, { useState, useCallback, useEffect } from "react";
import {
  Upload,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";
import Editor from "../Editor";

// Initialize PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const ResizableSplitPaneWithPDF = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [splitPosition, setSplitPosition] = useState(45);
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1.0);
  const [initialScale, setInitialScale] = useState(1.0);
  const canvasRef = React.useRef(null);

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
      try {
        const arrayBuffer = await file.arrayBuffer();
        const loadedPdf = await pdfjsLib.getDocument({ data: arrayBuffer })
          .promise;
        setPdfDoc(loadedPdf);
        setNumPages(loadedPdf.numPages);
        setCurrentPage(1);
      } catch (error) {
        console.error("Error loading PDF:", error);
      }
    }
  };

  const renderPage = async () => {
    if (!pdfDoc || !canvasRef.current) return;

    try {
      const page = await pdfDoc.getPage(currentPage);
      const viewport = page.getViewport({ scale });
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({
        canvasContext: context,
        viewport: viewport,
      }).promise;
    } catch (error) {
      console.error("Error rendering page:", error);
    }
  };

  useEffect(() => {
    renderPage();
  }, [currentPage, scale, pdfDoc]);

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleMouseMove = useCallback(
    (e) => {
      if (!isDragging) return;
      const container = e.currentTarget;
      const containerRect = container.getBoundingClientRect();
      const newPosition =
        ((e.clientX - containerRect.left) / containerRect.width) * 100;
      setSplitPosition(Math.min(Math.max(newPosition, 30), 80));
    },
    [isDragging]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleGestureStart = useCallback(
    (e) => {
      // Only handle gesture if it starts within the PDF viewer area
      if (
        e.target.tagName === "CANVAS" ||
        e.target.closest(".pdf-viewer-area")
      ) {
        e.preventDefault();
        setInitialScale(scale);
      }
    },
    [scale]
  );

  const handleGestureChange = useCallback(
    (e) => {
      // Only handle gesture if it started within the PDF viewer area
      if (
        e.target.tagName === "CANVAS" ||
        e.target.closest(".pdf-viewer-area")
      ) {
        e.preventDefault();
        const newScale = initialScale * e.scale;
        setScale(Math.min(Math.max(newScale, 0.1), 5.0));
      }
    },
    [initialScale]
  );

  const handleGestureEnd = useCallback((e) => {
    // Only handle gesture if it started within the PDF viewer area
    if (e.target.tagName === "CANVAS" || e.target.closest(".pdf-viewer-area")) {
      e.preventDefault();
    }
  }, []);

  const handleWheel = useCallback((e) => {
    // Only handle zoom if the event target is within the PDF viewer area
    if (
      (e.ctrlKey || e.metaKey) &&
      (e.target.tagName === "CANVAS" || e.target.closest(".pdf-viewer-area"))
    ) {
      e.preventDefault();
      const delta = e.deltaY * -0.01;
      setScale((prevScale) => Math.min(Math.max(prevScale + delta, 0.1), 5.0));
    }
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("mouseleave", handleMouseUp);
    } else {
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseleave", handleMouseUp);
    }
    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseleave", handleMouseUp);
    };
  }, [isDragging, handleMouseUp]);

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
        <div className="bg-gray-100 p-4 border-b flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage <= 1}
              className="p-2 rounded hover:bg-gray-200 disabled:opacity-50"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="text-sm">
              Page {currentPage} of {numPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, numPages))
              }
              disabled={currentPage >= numPages}
              className="p-2 rounded hover:bg-gray-200 disabled:opacity-50"
            >
              <ChevronRight size={20} />
            </button>
            <button
              onClick={() => setScale((prev) => prev + 0.1)}
              className="p-2 rounded hover:bg-gray-200"
            >
              <ZoomIn size={20} />
            </button>
            <button
              onClick={() => setScale((prev) => Math.max(prev - 0.1, 0.1))}
              className="p-2 rounded hover:bg-gray-200"
            >
              <ZoomOut size={20} />
            </button>
          </div>
          <label className="cursor-pointer text-blue-500 hover:text-blue-600 text-sm">
            Change File
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>
        <div className="flex-1 overflow-auto bg-gray-50 flex items-center justify-center p-4">
          <div
            className="relative"
            onWheel={handleWheel}
            onGestureStart={handleGestureStart}
            onGestureChange={handleGestureChange}
            onGestureEnd={handleGestureEnd}
          >
            <canvas ref={canvasRef} className="shadow-lg" />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className="w-full h-screen flex relative bg-gray-100 select-none"
      onMouseMove={handleMouseMove}
    >
      <div
        className="h-full bg-white overflow-hidden"
        style={{ width: `${splitPosition}%` }}
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
        <Editor />
      </div>
    </div>
  );
};

export default ResizableSplitPaneWithPDF;
