import React, { useState, useEffect } from "react";

const prompts = [
  "Explain quantum computing",
  "Write a haiku about AI",
  "Describe the water cycle",
  "What is machine learning?",
  "Summarize string theory",
];

const outputs = [
  "Quantum computing uses qubits and superposition to perform complex calculations faster than classical computers.",
  "Silicon dreams awake\nNeural networks pulse with thought\nAI awakens now",
  "Water evaporates, forms clouds, rains, flows through rivers, and repeats the cycle.",
  "Machine learning is AI that improves through experience, learning from data without explicit programming.",
  "String theory proposes all matter and forces consist of tiny vibrating strings in multiple dimensions.",
];

const LLMPromptingVisualization = () => {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [currentSet, setCurrentSet] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setIsDarkMode(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    const animateText = async (text, setter, isOutput = false) => {
      for (let i = 0; i <= text.length; i++) {
        setter(text.slice(0, i));
        if (isOutput) {
          setLoadingProgress((i / text.length) * 100);
        }
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
    };

    const runAnimation = async () => {
      const prompt = prompts[currentSet];
      const output = outputs[currentSet];

      setInputText("");
      setOutputText("");
      setLoadingProgress(0);
      await animateText(prompt, setInputText);
      await new Promise((resolve) => setTimeout(resolve, 500));
      await animateText(output, setOutputText, true);

      await new Promise((resolve) => setTimeout(resolve, 2000));
      setCurrentSet((currentSet + 1) % prompts.length);
    };

    runAnimation();
  }, [currentSet]);

  return (
    <div
      style={{
        fontFamily: "monospace",
        fontSize: "16px",
        lineHeight: "1.5",
        padding: "20px",
        height: "200px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        color: isDarkMode ? "white" : "black",
      }}
    >
      <div style={{ minHeight: "24px" }}>{inputText}</div>
      <div
        style={{
          width: "100%",
          height: "2px",
          backgroundColor: "#e0e0e0",
          margin: "10px 0",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            height: "100%",
            backgroundColor: "black",
            width: `${loadingProgress}%`,
            transition: "width 0.05s linear",
          }}
        />
      </div>
      <div style={{ minHeight: "72px" }}>{outputText}</div>
    </div>
  );
};

export default LLMPromptingVisualization;
