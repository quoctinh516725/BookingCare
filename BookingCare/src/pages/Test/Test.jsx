import { useState } from "react";
import { toast } from "sonner";

const questions = [
  {
    id: 1,
    question: "Làn da của bạn cảm thấy thế nào vào buổi sáng sau khi rửa mặt?",
    options: [
      { value: "Dầu", label: "Bóng nhờn, đặc biệt ở vùng chữ T" },
      { value: "Khô", label: "Căng và khô" },
      { value: "Hỗn hợp", label: "Vùng chữ T hơi bóng, má khô" },
      { value: "Thường", label: "Bình thường, không quá khô hay nhờn" },
    ],
  },
  {
    id: 2,
    question: "Lỗ chân lông của bạn như thế nào?",
    options: [
      { value: "Dầu", label: "Nổi rõ, đặc biệt ở vùng chữ T" },
      { value: "Khô", label: "Gần như không nhìn thấy" },
      { value: "Hỗn hợp", label: "Nổi rõ ở vùng chữ T, khó nhìn thấy ở má" },
      { value: "Thường", label: "Khó nhìn thấy" },
    ],
  },
  {
    id: 3,
    question: "Làn da của bạn phản ứng thế nào với ánh nắng mặt trời?",
    options: [
      { value: "Dầu", label: "Dễ bóng nhờn hơn" },
      { value: "Khô", label: "Dễ bị khô và bong tróc" },
      { value: "Hỗn hợp", label: "Vùng chữ T bóng nhờn, má khô hơn" },
      { value: "Thường", label: "Đều màu, ít thay đổi" },
    ],
  },
  {
    id: 4,
    question: "Bạn có thường xuyên bị mụn không?",
    options: [
      { value: "Dầu", label: "Thường xuyên, đặc biệt là vùng chữ T" },
      { value: "Khô", label: "Hiếm khi" },
      { value: "Hỗn hợp", label: "Đôi khi, chủ yếu ở vùng chữ T" },
      { value: "Thường", label: "Thỉnh thoảng" },
    ],
  },
  {
    id: 5,
    question: "Làn da của bạn có dễ bị đỏ, ngứa hoặc kích ứng không?",
    options: [
      { value: "Dầu", label: "Hiếm khi" },
      { value: "Khô", label: "Thường xuyên" },
      { value: "Hỗn hợp", label: "Đôi khi ở vùng má" },
      { value: "Thường", label: "Hiếm khi" },
    ],
  },
  {
    id: 6,
    question: "Bạn cảm thấy làn da của mình như thế nào vào cuối ngày?",
    options: [
      { value: "Dầu", label: "Bóng nhờn, cần giấy thấm dầu" },
      { value: "Khô", label: "Căng và có thể bong tróc" },
      { value: "Hỗn hợp", label: "Dầu ở vùng chữ T, khô ở má" },
      { value: "Thường", label: "Bình thường, không quá dầu hay khô" },
    ],
  },
  {
    id: 7,
    question: "Khi sử dụng sản phẩm dưỡng ẩm, da của bạn phản ứng thế nào?",
    options: [
      { value: "Dầu", label: "Cảm giác nhờn rít và nặng mặt" },
      { value: "Khô", label: "Hấp thụ nhanh, cần thêm dưỡng ẩm" },
      { value: "Hỗn hợp", label: "Nhờn ở vùng chữ T nhưng khô ở má" },
      { value: "Thường", label: "Hấp thụ tốt, không nhờn rít" },
    ],
  },
];

const Test = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [skinTypeResult, setSkinTypeResult] = useState(null);

  const totalQuestions = questions.length;
  const progress = (currentQuestionIndex / totalQuestions) * 100;

  const handleAnswerSelect = (answer) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = answer;
    setAnswers(newAnswers);
  };

  const goToNextQuestion = () => {
    if (answers[currentQuestionIndex]) {
      if (currentQuestionIndex < totalQuestions - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        calculateResult();
      }
    } else {
      toast.error("Vui lòng chọn một đáp án");
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const calculateResult = () => {
    const counts = { Dầu: 0, Khô: 0, "Hỗn hợp": 0, Thường: 0 };
    answers.forEach((answer) => {
      counts[answer] += 1;
    });
    let result = "Thường";
    let maxCount = 0;
    Object.entries(counts).forEach(([type, count]) => {
      if (count > maxCount) {
        maxCount = count;
        result = type;
      }
    });
    setSkinTypeResult(result);
    setShowResult(true);
  };

  const restartQuiz = () => {
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setShowResult(false);
    setSkinTypeResult(null);
  };

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="container mx-auto px-4 py-8 mt-16">
        <h1 className="text-3xl font-bold text-center mb-8">
          Trắc nghiệm loại da
        </h1>
        <div className="max-w-3xl mx-auto bg-white shadow-md rounded-lg p-6">
          {!showResult ? (
            <>
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-medium">
                  Câu hỏi {currentQuestionIndex + 1} / {totalQuestions}
                </span>
                <span className="text-sm font-medium">
                  {progress.toFixed(0)}%
                </span>
              </div>
              <div className="mb-4 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[var(--primary-color)] transition-[width] duration-1000 ease-in-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <h2 className="text-xl font-semibold mb-4">
                {currentQuestion.question}
              </h2>
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <label
                    key={index}
                    className="block p-3 border border-black/30 rounded-lg cursor-pointer hover:bg-gray-100"
                  >
                    <input
                      type="radio"
                      name="answer"
                      value={option.value}
                      checked={answers[currentQuestionIndex] === option.value}
                      onChange={() => handleAnswerSelect(option.value)}
                      className="mr-2"
                    />
                    {option.label}
                  </label>
                ))}
              </div>
              <div className="flex justify-between pt-4">
                <button
                  className="px-4 py-2 bg-gray-300 rounded-lg"
                  onClick={goToPreviousQuestion}
                  disabled={currentQuestionIndex === 0}
                >
                  Quay lại
                </button>
                <button
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg"
                  onClick={goToNextQuestion}
                >
                  {currentQuestionIndex === totalQuestions - 1
                    ? "Xem kết quả"
                    : "Tiếp theo"}
                </button>
              </div>
            </>
          ) : (
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Kết quả trắc nghiệm</h2>
              <p className="text-lg">
                Loại da của bạn:{" "}
                <span className="font-semibold">{skinTypeResult}</span>
              </p>
              <div className="flex justify-center">
                <button
                  className="mt-4 px-4 py-2 bg-gray-300 rounded-lg"
                  onClick={restartQuiz}
                >
                  Làm lại trắc nghiệm
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Test;
