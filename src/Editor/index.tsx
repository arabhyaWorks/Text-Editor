import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  FileText,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Columns,
  GripVertical,
  X,
  Plus,
  Settings,
} from "lucide-react";

import { Mic, MicOff, Loader2 } from "lucide-react";
import { useVoiceRecorder } from "../voiceModule/voice-Base64";
import { useBhashiniVoice } from "../voiceModule/bhashini-voice";

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  SectionType,
  PageOrientation,
} from "docx";
import { saveAs } from "file-saver";
import classNames from "classnames";

// A4 dimensions in pixels (96 DPI)
const A4_WIDTH = 816; // 8.27 inches
const A4_HEIGHT = 1056; // 11.69 inches
const PAGE_MARGIN = 96; // 1 inch margins
const CONTENT_HEIGHT = A4_HEIGHT - 2 * PAGE_MARGIN;

interface DraggableComponent {
  id: string;
  type: "header" | "subheader" | "columns";
  title: string;
  icon: React.ReactNode;
}

const draggableComponents: DraggableComponent[] = [
  {
    id: "header",
    type: "header",
    title: "Header",
    icon: <Heading1 className="w-4 h-4" />,
  },
  {
    id: "subheader",
    type: "subheader",
    title: "Subheader",
    icon: <Heading2 className="w-4 h-4" />,
  },
  {
    id: "columns",
    type: "columns",
    title: "Two Columns",
    icon: <Columns className="w-4 h-4" />,
  },
];

interface Page {
  components: {
    id: string;
    type: string;
    content: string | { column1: string; column2: string };
  }[];
}

const handleDeleteComponent = (
  pageIndex: number,
  componentIndex: number,
  pages: Page[],
  setPages: React.Dispatch<React.SetStateAction<Page[]>>
) => {
  const newPages = [...pages];
  newPages[pageIndex].components.splice(componentIndex, 1);
  setPages(newPages);
};

function Editor() {
  const [pages, setPages] = useState<Page[]>([{ components: [] }]);
  const [currentPage, setCurrentPage] = useState(0);
  const [insertIndex, setInsertIndex] = useState<number | null>(null);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Handle voice recording and transcription
  const [transcriptionHistory, setTranscriptionHistory] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { isRecording, base64Audio, startRecording, stopRecording } =
    useVoiceRecorder();
  const { transcribedText, transcribeAudio } = useBhashiniVoice();

  const handleClick = useCallback(async () => {
    if (isRecording) {
      console.log("Stopping recording...");
      try {
        await stopRecording();
        setIsProcessing(true);
      } catch (err) {
        console.error("Error stopping:", err);
      }
    } else if (!isProcessing) {
      console.log("Starting recording...");
      try {
        await startRecording();
      } catch (err) {
        console.error("Error starting:", err);
      }
    }
  }, [isRecording, isProcessing, startRecording, stopRecording]);

  // Handle audio processing and transcription
  React.useEffect(() => {
    if (base64Audio && isProcessing && !isRecording) {
      console.log("Processing audio...");
      transcribeAudio(base64Audio).finally(() => {
        setIsProcessing(false);
      });
    }
  }, [base64Audio, isRecording, transcribeAudio]);

  // Handle transcribed text
  React.useEffect(() => {
    if (transcribedText) {
      setTranscriptionHistory((prev) => [transcribedText, ...prev].slice(0, 2));
    }
  }, [transcribedText]);

  useEffect(() => {
    pageRefs.current = pageRefs.current.slice(0, pages.length);
  }, [pages]);

  const handleColumnInput = (
    e: React.FormEvent<HTMLDivElement>,
    component: any,
    columnIndex: number
  ) => {
    const target = e.target as HTMLDivElement;
    const columnHeight = target.scrollHeight;
    const parentElement = target.closest(".columns-container");

    if (columnHeight > CONTENT_HEIGHT / 2) {
      // Half of A4 height for each column
      e.preventDefault();

      // If we're in the left column, move to right column
      if (columnIndex === 0) {
        const rightColumn = parentElement?.querySelector(
          ".right-column"
        ) as HTMLElement;
        if (rightColumn) {
          rightColumn.focus();
          const selection = window.getSelection();
          const range = document.createRange();
          range.selectNodeContents(rightColumn);
          range.collapse(true);
          selection?.removeAllRanges();
          selection?.addRange(range);
          return;
        }
      } else {
        // If we're in the right column
        // Create new page if we're at the end
        if (currentPage === pages.length - 1) {
          setPages([...pages, { components: [] }]);
          setCurrentPage(currentPage + 1);
        } else {
          // Move to next page
          setCurrentPage(currentPage + 1);
        }

        // Focus the first column of the next page
        setTimeout(() => {
          const nextPage = pageRefs.current[currentPage + 1];
          if (nextPage) {
            const firstColumn = nextPage.querySelector(
              "[contenteditable]"
            ) as HTMLElement;
            if (firstColumn) {
              firstColumn.focus();
            }
          }
        }, 0);
      }
    }
  };

  const handleDragStart = (e: React.DragEvent, componentType: string) => {
    e.dataTransfer.setData("componentType", componentType);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, pageIndex: number) => {
    e.preventDefault();
    const componentType = e.dataTransfer.getData("componentType");
    const dropIndex =
      insertIndex !== null ? insertIndex : pages[pageIndex].components.length;
    setInsertIndex(null);

    const newComponent = {
      id: `${componentType}-${Date.now()}`,
      type: componentType,
      content: componentType === "columns" ? { column1: "", column2: "" } : "",
    };

    const newPages = [...pages];
    newPages[pageIndex].components.splice(dropIndex, 0, newComponent);
    setPages(newPages);
  };

  const handleDragEnter = (index: number) => {
    setInsertIndex(index);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (!relatedTarget?.closest(".component-drop-zone")) {
      setInsertIndex(null);
    }
  };
  const handleFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value);
  };

  const handleFontSize = (e: React.ChangeEvent<HTMLSelectElement>) => {
    document.execCommand("fontSize", false, e.target.value);
  };

  const handleFontFamily = (e: React.ChangeEvent<HTMLSelectElement>) => {
    document.execCommand("fontName", false, e.target.value);
  };

  const handlePageChange = (pageIndex: number) => {
    setCurrentPage(pageIndex);
  };

  const exportToWord = async () => {
    const doc = new Document({
      sections: [
        {
          properties: {
            type: SectionType.NEXT_PAGE,
            page: {
              size: {
                orientation: PageOrientation.PORTRAIT,
                width: 12240,
                height: 15840,
              },
              margin: {
                top: 1440,
                right: 1440,
                bottom: 1440,
                left: 1440,
              },
            },
          },
          children: [],
        },
        {
          properties: {
            type: SectionType.CONTINUOUS,
            page: {
              size: {
                orientation: PageOrientation.PORTRAIT,
                width: 12240,
                height: 15840,
              },
              margin: {
                top: 1440,
                right: 1440,
                bottom: 1440,
                left: 1440,
              },
            },
            column: {
              space: 720,
              count: 2,
              equalWidth: true,
            },
          },
          children: pages.flatMap((page) =>
            page.components.map((component) => {
              if (component.type === "header") {
                return new Paragraph({
                  children: [
                    new TextRun({
                      text: component.content as string,
                      size: 32,
                      bold: true,
                      font: "Times New Roman",
                    }),
                  ],
                  alignment: "center",
                });
              }
              if (component.type === "subheader") {
                return new Paragraph({
                  children: [
                    new TextRun({
                      text: component.content as string,
                      size: 24,
                      font: "Times New Roman",
                    }),
                  ],
                  alignment: "center",
                });
              }
              if (component.type === "columns") {
                const columnsContent = component.content as {
                  column1: string;
                  column2: string;
                };
                return [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: columnsContent.column1,
                        size: 24,
                        font: "Times New Roman",
                      }),
                    ],
                  }),
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: columnsContent.column2,
                        size: 24,
                        font: "Times New Roman",
                      }),
                    ],
                  }),
                ];
              }
              return new Paragraph({});
            })
          ),
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, "parliamentary-debates.docx");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="absolute bottom-20 left-0">
        <div className="relative p-2 py-4">
          {/* Animation layers */}
          {isRecording && (
            <>
              <div className="absolute inset-0 border-4 border-blue-200 rounded-full animate-spin pointer-events-none" />
              <div className="absolute inset-2 border-4 border-blue-400 rounded-full animate-ping pointer-events-none" />
            </>
          )}

          {/* Mic Button */}
          <button
            onClick={handleClick}
            className={`relative z-10 w-24 h-24 flex items-center justify-center
                    ${
                      isRecording
                        ? "bg-red-600 hover:bg-red-700"
                        : "bg-blue-600 hover:bg-blue-700"
                    }
                    ${
                      isProcessing ? "opacity-50 cursor-wait" : "cursor-pointer"
                    }
                    rounded-full transition-colors shadow-lg focus:outline-none focus:ring-2 
                    focus:ring-offset-2 ${
                      isRecording ? "focus:ring-red-500" : "focus:ring-blue-500"
                    }`}
          >
            {isRecording ? (
              <MicOff className="w-12 h-12 text-white" />
            ) : (
              <Mic className="w-12 h-12 text-white" />
            )}
          </button>
        </div>


      {/* Transcriptions display */}
      <div className="fixed bottom-4 right-4 space-y-4">
        {transcriptionHistory.map((text, index) => (
          <div
            key={index}
            className={`bg-white p-4 rounded-lg shadow-lg max-w-md ${
              index > 0 ? "opacity-75" : ""
            }`}
          >
            <div className="text-xs text-gray-500 mb-1">
              {index === 0
                ? "Current transcription:"
                : "Previous transcription:"}
            </div>
            <p className="text-sm text-gray-900">{text}</p>
          </div>
        ))}
      </div>
      </div>
      <main
        className={classNames(
          "flex gap-6"
          // "px-4 py-8",
          // "max-w-[1400px]",
          // "mx-auto"
        )}
      >
        {/* Editor */}
        <div className="flex-1">
          <div className="bg-white p-4 mb-6 shadow-sm rounded sticky top-0 z-10">
            {/* Formatting Toolbar */}
            <div className="flex flex-wrap gap-2 items-center">
              <select
                onChange={handleFontFamily}
                className="px-2 py-1 border rounded hover:bg-gray-50"
              >
                <option value="Times New Roman">Times New Roman</option>
                <option value="Arial">Arial</option>
                <option value="Helvetica">Helvetica</option>
                <option value="Georgia">Georgia</option>
                <option value="Garamond">Garamond</option>
              </select>

              <select
                onChange={handleFontSize}
                className="px-2 py-1 border rounded hover:bg-gray-50"
              >
                <option value="1">Small</option>
                <option value="2">Medium</option>
                <option value="3">Large</option>
                <option value="4">X-Large</option>
                <option value="5">XX-Large</option>
              </select>

              <div className="flex gap-1 border-l pl-2">
                <button
                  onClick={() => handleFormat("bold")}
                  className="p-2 hover:bg-gray-100 rounded"
                  title="Bold"
                >
                  <Bold className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleFormat("italic")}
                  className="p-2 hover:bg-gray-100 rounded"
                  title="Italic"
                >
                  <Italic className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleFormat("underline")}
                  className="p-2 hover:bg-gray-100 rounded"
                  title="Underline"
                >
                  <Underline className="w-4 h-4" />
                </button>
              </div>

              <div className="flex gap-1 border-l pl-2">
                <button
                  onClick={() => handleFormat("justifyLeft")}
                  className="p-2 hover:bg-gray-100 rounded"
                  title="Align Left"
                >
                  <AlignLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleFormat("justifyCenter")}
                  className="p-2 hover:bg-gray-100 rounded"
                  title="Align Center"
                >
                  <AlignCenter className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleFormat("justifyRight")}
                  className="p-2 hover:bg-gray-100 rounded"
                  title="Align Right"
                >
                  <AlignRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleFormat("justifyFull")}
                  className="p-2 hover:bg-gray-100 rounded"
                  title="Justify"
                >
                  <AlignJustify className="w-4 h-4" />
                </button>
              </div>

              <div className="flex gap-1 border-l pl-2">
                <button
                  onClick={() => handleFormat("insertUnorderedList")}
                  className="p-2 hover:bg-gray-100 rounded"
                  title="Bullet List"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleFormat("insertOrderedList")}
                  className="p-2 hover:bg-gray-100 rounded"
                  title="Numbered List"
                >
                  <ListOrdered className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Settings className="w-4 h-4" />
                Add
              </button>
            </div>

            {/* Adding New Pages */}
            <div className="w-full flex gap-2 mt-2">
              {pages.map((_, index) => (
                <button
                  key={index}
                  className={`px-4 py-2 rounded ${
                    currentPage === index
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                  onClick={() => handlePageChange(index)}
                >
                  Page {index + 1}
                </button>
              ))}
              <button
                onClick={() => setPages([...pages, { components: [] }])}
                className="px-4 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
              >
                + Add Page
              </button>
            </div>
          </div>

          {/* Adding new Heading  */}
          {isOpen && (
            <div className="absolute top-1 right-5 z-20">
              <div className="">
                <div
                  className={classNames(
                    "w-64 bg-white rounded-lg shadow-lg border h-fit"
                  )}
                >
                  <div
                    className={classNames(
                      "p-4 border-b flex justify-between items-center"
                    )}
                  >
                    <h2 className="font-semibold text-gray-700">Components</h2>
                    <button>
                      <X
                        className={classNames(
                          "w-4 h-4",
                          "hover:w-5 hover:h-5",
                          "hover:text-red-700",
                          "transition-all",
                          "duration-300",
                          "ease-in-out"
                        )}
                        onClick={() => setIsOpen(false)}
                      />
                    </button>
                  </div>
                  <div className="p-4 space-y-2 rounded">
                    {draggableComponents.map((component) => (
                      <div
                        key={component.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, component.type)}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded cursor-move hover:bg-gray-100 transition-colors"
                      >
                        <GripVertical className="w-4 h-4 text-gray-400" />
                        {component.icon}
                        <span className="text-sm text-gray-600">
                          {component.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div
            ref={(el) => (pageRefs.current[currentPage] = el)}
            className="bg-white shadow-sm rounded mb-4 h-[1056px] w-[816px] mx-auto p-[1in] overflow-hidden"
            onDragOver={handleDragOver}
            onDrop={(e) => {
              handleDrop(e, currentPage);
              setInsertIndex(null);
            }}
          >
            {pages[currentPage].components.map((component, index) => (
              <React.Fragment key={component.id}>
                {/* {index === 0 && (
                  <div
                    className={`h-8 -mt-4 mb-2 relative component-drop-zone ${
                      insertIndex === 0 ? "opacity-100" : "opacity-0"
                    } transition-all`}
                    onDragEnter={() => handleDragEnter(0)}
                    onDragLeave={handleDragLeave}
                  >
                    <div className="absolute inset-x-0 top-1/2 border-2 border-dashed border-blue-400 rounded-lg"></div>
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-500 text-white p-1 rounded-full">
                      <Plus className="w-3 h-3" />
                    </div>
                  </div>
                )} */}
                <div className="mb-6 relative group">
                  <button
                    onClick={() =>
                      handleDeleteComponent(currentPage, index, pages, setPages)
                    }
                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all z-10"
                    title="Delete component"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  {component.type === "header" && (
                    <div
                      contentEditable
                      className="outline-none text-center text-2xl font-bold p-4 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50 hover:bg-white hover:border-blue-200 transition-colors"
                      suppressContentEditableWarning
                    >
                      {component.content}
                    </div>
                  )}
                  {component.type === "subheader" && (
                    <div
                      contentEditable
                      className="outline-none text-center text-xl p-3 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50/50 hover:bg-white hover:border-blue-200 transition-colors"
                      suppressContentEditableWarning
                    >
                      {component.content}
                    </div>
                  )}
                  {component.type === "columns" && (
                    <div className="columns-container flex gap-8 p-4 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50/30 hover:bg-white hover:border-blue-200 transition-colors">
                      <div
                        contentEditable
                        style={{
                          maxHeight: `${CONTENT_HEIGHT / 2}px`,
                          overflowY: "hidden",
                        }}
                        onInput={(e) => handleColumnInput(e, component, 0)}
                        className="flex-1 outline-none p-3 border-r border-gray-200 left-column"
                        suppressContentEditableWarning
                      >
                        {(component.content as { column1: string }).column1}
                      </div>
                      <div
                        contentEditable
                        style={{
                          maxHeight: `${CONTENT_HEIGHT / 2}px`,
                          overflowY: "hidden",
                        }}
                        onInput={(e) => handleColumnInput(e, component, 1)}
                        className="flex-1 outline-none p-3 right-column"
                        suppressContentEditableWarning
                      >
                        {(component.content as { column2: string }).column2}
                      </div>
                    </div>
                  )}
                </div>
                <div
                  className={`h-8 -my-2 relative component-drop-zone ${
                    insertIndex === index + 1 ? "opacity-100" : "opacity-0"
                  } transition-all`}
                  onDragEnter={() => handleDragEnter(index + 1)}
                  onDragLeave={handleDragLeave}
                >
                  <div className="absolute inset-x-0 top-1/2 border-2 border-dashed border-blue-400 rounded-lg"></div>
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-500 text-white p-1 rounded-full">
                    <Plus className="w-3 h-3" />
                  </div>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Editor;
