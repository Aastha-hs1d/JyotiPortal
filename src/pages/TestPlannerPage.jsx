import { useState, useEffect } from "react";
import { FileText, Sparkles, Download, History, Eye } from "lucide-react";
import * as pdfjsLib from "pdfjs-dist/build/pdf";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.js?worker";
import jsPDF from "jspdf";
import Loader from "../components/Loader";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export default function TestPlannerPage() {
  const [file, setFile] = useState(null);
  const [pdfText, setPdfText] = useState("");
  const [showFullText, setShowFullText] = useState(false);
  const [testType, setTestType] = useState("mixed");
  const [difficulty, setDifficulty] = useState("medium");
  const [questionCount, setQuestionCount] = useState(10);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [showAnswers, setShowAnswers] = useState(false);
  const [savedTests, setSavedTests] = useState([]);

  // 🧾 Load previous tests
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("savedTests")) || [];
    setSavedTests(stored);
  }, []);

  // 💾 Save new test
  const saveTest = (testData) => {
    const newTests = [testData, ...savedTests].slice(0, 5);
    setSavedTests(newTests);
    localStorage.setItem("savedTests", JSON.stringify(newTests));
  };

  // 📖 Extract text from uploaded PDF
  const extractPdfText = async (file) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let textContent = "";
      const maxPages = Math.min(pdf.numPages, 5);

      for (let i = 1; i <= maxPages; i++) {
        const page = await pdf.getPage(i);
        const text = await page.getTextContent();
        const pageText = text.items.map((t) => t.str).join(" ");
        textContent += pageText + "\n\n";
      }

      setPdfText(textContent || "No readable text found in this PDF.");
    } catch (err) {
      console.error("Error reading PDF:", err);
      setPdfText("⚠️ Unable to read text from this file.");
    }
  };

  // 🧠 Dummy generator (replace with backend later)
  const generateQuestions = async () => {
    if (!file) return alert("Please upload a PDF first!");
    setLoading(true);

    setTimeout(() => {
      const dummyQs = Array.from({ length: questionCount }, (_, i) => ({
        id: i + 1,
        text: `Q${i + 1}. (${
          difficulty.charAt(0).toUpperCase() + difficulty.slice(1)
        }) This is a ${testType} question based on concept #${i + 1}.`,
        options:
          testType === "mcq"
            ? ["A. Option 1", "B. Option 2", "C. Option 3", "D. Option 4"]
            : null,
        answer: "Answer coming soon...",
      }));

      const testData = {
        id: Date.now(),
        fileName: file.name,
        type: testType,
        count: questionCount,
        difficulty,
        date: new Date().toLocaleString(),
        questions: dummyQs,
      };

      setQuestions(dummyQs);
      saveTest(testData);
      setLoading(false);
    }, 1500);
  };

  // 🧾 Export test to PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    let y = 20;
    doc.setFontSize(14);
    doc.text(`Generated Test — ${file ? file.name : "Untitled"}`, 10, y);
    y += 10;
    doc.setFontSize(11);

    questions.forEach((q, i) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(`${i + 1}. ${q.text}`, 10, y);
      y += 8;

      if (q.options) {
        q.options.forEach((opt) => {
          doc.text(opt, 14, y);
          y += 6;
        });
      }

      if (showAnswers) {
        doc.setTextColor(0, 128, 0);
        doc.text(`Answer: ${q.answer}`, 14, y);
        doc.setTextColor(0, 0, 0);
        y += 8;
      }

      y += 4;
    });

    doc.save("Generated_Test.pdf");
  };

  const handleFileUpload = (e) => {
    const uploaded = e.target.files[0];
    if (uploaded) {
      setFile(uploaded);
      extractPdfText(uploaded);
    }
  };

  return (
    <div className="p-6 space-y-8">
      <Loader show={loading} text="Generating test..." />;
      <p className="text-gray-600">
        Upload a PDF and generate customized question papers automatically ✨
      </p>
      {/* Upload Section */}
      <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <FileText size={18} className="text-[var(--color-primary)]" />
          Upload Study Material
        </h2>
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileUpload}
          className="block w-full text-sm text-gray-700 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[var(--color-primary)] file:text-white hover:file:opacity-90 transition-all duration-200 hover:scale-[1.01]"
        />
        {file && (
          <p className="text-sm text-green-600 mt-2">
            ✅ {file.name} uploaded successfully
          </p>
        )}
      </div>
      {/* PDF Preview */}
      {pdfText && (
        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <Eye size={18} className="text-[var(--color-primary)]" />
            Preview PDF Content
          </h2>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-60 overflow-y-auto text-gray-700 text-sm whitespace-pre-wrap">
            {showFullText
              ? pdfText
              : pdfText.slice(0, 500) + (pdfText.length > 500 ? "..." : "")}
          </div>
          {pdfText.length > 500 && (
            <button
              onClick={() => setShowFullText(!showFullText)}
              className="mt-3 text-[var(--color-primary)] text-sm font-medium hover:underline cursor-pointer"
            >
              {showFullText ? "Show Less ▲" : "Show More ▼"}
            </button>
          )}
        </div>
      )}
      {/* Test Configuration */}
      <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 space-y-4">
        <h2 className="text-lg font-semibold text-gray-700 mb-2 flex items-center gap-2">
          <Sparkles size={18} className="text-[var(--color-primary)]" />
          Test Preferences
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          {/* Test Type */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Test Type
            </label>
            <select
              value={testType}
              onChange={(e) => setTestType(e.target.value)}
              className="border border-gray-300 rounded-lg w-full px-3 py-2 focus:ring-2 focus:ring-[var(--color-primary-light)] cursor-pointer"
            >
              <option value="mcq">MCQs</option>
              <option value="short">Short Questions</option>
              <option value="long">Long Questions</option>
              <option value="fillups">Fill in the Blanks</option>
              <option value="mixed">Mixed</option>
            </select>
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Difficulty
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="border border-gray-300 rounded-lg w-full px-3 py-2 focus:ring-2 focus:ring-[var(--color-primary-light)] cursor-pointer"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          {/* Number of Questions */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Number of Questions
            </label>
            <input
              type="number"
              min="1"
              value={questionCount}
              onChange={(e) => setQuestionCount(parseInt(e.target.value))}
              className="border border-gray-300 rounded-lg w-full px-3 py-2 focus:ring-2 focus:ring-[var(--color-primary-light)] cursor-pointer"
            />
          </div>

          {/* Generate Button */}
          <div className="flex items-end">
            <button
              onClick={generateQuestions}
              disabled={loading}
              className={`flex items-center justify-center gap-2 w-full px-4 py-2 rounded-lg text-white transition-all duration-300 cursor-pointer ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[var(--color-primary)] hover:opacity-90 hover:scale-[1.03]"
              }`}
            >
              {loading ? (
                <>
                  <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4"></span>
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  Generate Test
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      {/* Generated Questions */}
      {questions.length > 0 && (
        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-semibold text-gray-700">
                Generated Test
              </h2>
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showAnswers}
                  onChange={() => setShowAnswers(!showAnswers)}
                  className="w-4 h-4 accent-[var(--color-primary)]"
                />
                Show Answers
              </label>
            </div>

            <button
              onClick={exportToPDF}
              className="flex items-center gap-2 bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg hover:opacity-90 hover:scale-[1.03] transition-all duration-200 cursor-pointer"
            >
              <Download size={16} />
              Export PDF
            </button>
          </div>

          <div className="space-y-4">
            {questions.map((q) => (
              <div
                key={q.id}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-200"
              >
                <p className="font-medium text-gray-800 mb-2">{q.text}</p>
                {q.options && (
                  <ul className="list-disc pl-5 text-gray-600 space-y-1 text-sm">
                    {q.options.map((opt, i) => (
                      <li key={i}>{opt}</li>
                    ))}
                  </ul>
                )}
                {showAnswers && (
                  <p className="mt-2 text-green-700 font-medium text-sm">
                    Answer: {q.answer}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Previous Tests */}
      {savedTests.length > 0 && (
        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <History size={18} className="text-[var(--color-primary)]" />
            Previous Tests
          </h2>
          <div className="divide-y divide-gray-200">
            {savedTests.map((t) => (
              <div
                key={t.id}
                className="py-3 flex justify-between items-center hover:bg-gray-50 transition-all duration-200 cursor-pointer px-2 rounded-lg"
                onClick={() => setQuestions(t.questions)}
              >
                <div>
                  <p className="font-medium text-gray-800">{t.fileName}</p>
                  <p className="text-xs text-gray-500">
                    {t.type.toUpperCase()} • {t.count} questions •{" "}
                    {t.difficulty
                      ? t.difficulty.charAt(0).toUpperCase() +
                        t.difficulty.slice(1)
                      : "—"}{" "}
                    • {t.date}
                  </p>
                </div>
                <span className="text-sm text-[var(--color-primary)] font-medium">
                  Load
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
