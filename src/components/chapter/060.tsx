import React, { useState, useEffect } from "react";

const AICodeGenerator = () => {
  const [lines, setLines] = useState([]);
  const maxLines = 20;

  const generateCodeLine = () => {
    const keywords = [
      "function",
      "const",
      "let",
      "var",
      "if",
      "else",
      "for",
      "while",
      "return",
      "class",
      "import",
      "export",
      "async",
      "await",
      "try",
      "catch",
    ];
    const symbols = [
      "{",
      "}",
      "(",
      ")",
      "[",
      "]",
      ";",
      "=",
      "==",
      "===",
      ">",
      "<",
      ">=",
      "<=",
      "+=",
      "-=",
      "*=",
      "/=",
      "=>",
      "...",
    ];
    const names = [
      "data",
      "result",
      "value",
      "index",
      "item",
      "element",
      "node",
      "list",
      "array",
      "object",
      "string",
      "number",
      "boolean",
      "promise",
      "async",
      "request",
      "response",
    ];
    const types = [
      "string",
      "number",
      "boolean",
      "any",
      "void",
      "never",
      "unknown",
      "object",
      "Array<T>",
      "Promise<T>",
    ];

    const generateExpression = () => {
      const expressions = [
        () =>
          `${names[Math.floor(Math.random() * names.length)]}${
            symbols[Math.floor(Math.random() * symbols.length)]
          }`,
        () => `${Math.floor(Math.random() * 1000)}`,
        () => `"${names[Math.floor(Math.random() * names.length)]}"`,
        () =>
          `[${names[Math.floor(Math.random() * names.length)]}, ${
            names[Math.floor(Math.random() * names.length)]
          }]`,
        () =>
          `{${names[Math.floor(Math.random() * names.length)]}: ${
            names[Math.floor(Math.random() * names.length)]
          }}`,
      ];
      return expressions[Math.floor(Math.random() * expressions.length)]();
    };

    const lineTypes = [
      () =>
        `${keywords[Math.floor(Math.random() * keywords.length)]} ${
          names[Math.floor(Math.random() * names.length)]
        } ${
          symbols[Math.floor(Math.random() * symbols.length)]
        } ${generateExpression()};`,
      () =>
        `${keywords[Math.floor(Math.random() * keywords.length)]} ${
          names[Math.floor(Math.random() * names.length)]
        }(${names[Math.floor(Math.random() * names.length)]}: ${
          types[Math.floor(Math.random() * types.length)]
        }): ${types[Math.floor(Math.random() * types.length)]} ${
          symbols[Math.floor(Math.random() * symbols.length)]
        }`,
      () =>
        `  ${names[Math.floor(Math.random() * names.length)]}.${
          names[Math.floor(Math.random() * names.length)]
        }(${generateExpression()})${
          symbols[Math.floor(Math.random() * symbols.length)]
        }`,
      () =>
        `import { ${names[Math.floor(Math.random() * names.length)]}, ${
          names[Math.floor(Math.random() * names.length)]
        } } from '${names[Math.floor(Math.random() * names.length)]}';`,
      () =>
        `${keywords[Math.floor(Math.random() * keywords.length)]} (${
          names[Math.floor(Math.random() * names.length)]
        } ${
          symbols[Math.floor(Math.random() * symbols.length)]
        } ${generateExpression()}) ${
          symbols[Math.floor(Math.random() * symbols.length)]
        }`,
      () =>
        `${keywords[Math.floor(Math.random() * keywords.length)]} ${
          names[Math.floor(Math.random() * names.length)]
        } ${
          symbols[Math.floor(Math.random() * symbols.length)]
        } (${generateExpression()}) ${
          symbols[Math.floor(Math.random() * symbols.length)]
        } ${generateExpression()} : ${generateExpression()};`,
    ];

    return lineTypes[Math.floor(Math.random() * lineTypes.length)]();
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setLines((prevLines) => {
        const newLine = generateCodeLine();
        return [newLine, ...prevLines.slice(0, maxLines - 1)];
      });
    }, 150);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-4 h-screen overflow-hidden">
      <div className="font-mono text-black dark:text-white text-sm">
        {lines.map((line, index) => (
          <div
            key={index}
            className="animate-fade-in-down whitespace-nowrap overflow-hidden"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {line}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AICodeGenerator;
