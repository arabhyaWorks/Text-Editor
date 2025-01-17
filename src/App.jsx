import React from "react";
import ResizableSplitPaneWithPDF from "./components/ResizableSplitPaneWithPDF";
import DocumentHeader from "./components/DocumentHeaders";

function App() {
  return (
    <div className="h-screen w-full">
      <DocumentHeader />
      <ResizableSplitPaneWithPDF />
    </div>
  );
}

export default App;
