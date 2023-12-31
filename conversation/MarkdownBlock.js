import React from "react";
import ReactMarkdown from "react-markdown";
import SyntaxHighlighter from "react-syntax-highlighter";
import { a11yDark } from "react-syntax-highlighter/dist/cjs/styles/hljs";
import clipboardCopy from "clipboard-copy";
import { IconButton } from "@mui/material";
import {
  ContentCopy as ContentCopyIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";

export default function MarkdownBlock({ content, chatItem }) {
  const langMap = {
    "": "txt",
    python: "py",
    javascript: "js",
    typescript: "ts",
    html: "html",
    css: "css",
    json: "json",
    yaml: "yaml",
    markdown: "md",
    shell: "sh",
    bash: "sh",
    sql: "sql",
    java: "java",
    c: "c",
    cpp: "cpp",
    csharp: "cs",
    go: "go",
    rust: "rs",
    php: "php",
    ruby: "rb",
    perl: "pl",
    lua: "lua",
    r: "r",
    swift: "swift",
    kotlin: "kt",
    scala: "scala",
    clojure: "clj",
    elixir: "ex",
    erlang: "erl",
    haskell: "hs",
    ocaml: "ml",
    pascal: "pas",
    scheme: "scm",
    coffeescript: "coffee",
    fortran: "f",
    julia: "jl",
    lisp: "lisp",
    prolog: "pro",
    vbnet: "vb",
    dart: "dart",
    fsharp: "fs",
    groovy: "groovy",
    perl6: "pl",
    powershell: "ps1",
    puppet: "pp",
    qml: "qml",
    racket: "rkt",
    sas: "sas",
    verilog: "v",
    vhdl: "vhd",
    apex: "cls",
    matlab: "m",
    nim: "nim",
  };

  const renderMessage = () => {
    const message = content.toString();
    const match = message.match(/#(.*?)(?=\n|$)/);
    if (match) {
      if (message.includes("GENERATED_IMAGE:")) {
        const base64Image = match[1].replace("GENERATED_IMAGE:", "").trim();
        const formattedImage = base64Image.toString("base64");
        return message.replace(
          match[0],
          `![Generated Image](data:image/png;base64,${formattedImage})`
        );
      }
      if (message.includes("GENERATED_AUDIO:")) {
        const base64Audio = match[1].replace("GENERATED_AUDIO:", "").trim();
        const formattedAudio = base64Audio.toString("base64");
        return message.replace(
          match[0],
          `![Generated Audio](data:audio/wav;base64,${formattedAudio})`
        );
      }
    }
    return content;
  };
  const generateId = (text) => {
    return text ? text.toLowerCase().replace(/[^\w]+/g, "-") : "";
  };
  const handleAnchorClick = (e) => {
    const href = e.target.getAttribute("href");
    if (href.startsWith("#")) {
      e.preventDefault();
      const id = href.slice(1);
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      e.preventDefault();
      window.open(href, "_blank");
    }
  };

  const renderHeader = (Tag, children) => {
    let text = "";
    if (children && children[0]) {
      text = children[0];
    }
    const id = generateId(text);
    return <Tag id={id}>{children}</Tag>;
  };
  const renderLink = ({ node, children, ...props }) => {
    const isExternal = props.href && !props.href.startsWith("#");
    return (
      <a
        {...props}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noopener noreferrer" : undefined}
        onClick={isExternal ? undefined : handleAnchorClick}
      >
        {children}
      </a>
    );
  };
  return (
    <>
      <ReactMarkdown
        children={renderMessage(content)}
        className="react-markdown"
        components={{
          a: renderLink,
          h1({ node, children }) {
            return renderHeader("h1", children);
          },
          h2({ node, children }) {
            return renderHeader("h2", children);
          },
          h3({ node, children }) {
            return renderHeader("h3", children);
          },
          h4({ node, children }) {
            return renderHeader("h4", children);
          },
          ol({ children }) {
            return <ol style={{ paddingLeft: "2em" }}>{children}</ol>;
          },
          li({ children }) {
            return <li style={{ marginBottom: "0.5em" }}>{children}</li>;
          },
          code({ node, inline, children, ...props }) {
            if (inline) {
              return (
                <span
                  style={{
                    backgroundColor: "darkgray",
                    borderRadius: "3px",
                    padding: "0.2em",
                    fontFamily: "monospace",
                  }}
                >
                  {children}
                </span>
              );
            }
            const codeBlockRef = React.useRef(null);
            const language = props.className?.replace(/language-/, "");
            const fileExtension = langMap[language] || "txt";
            const ts = chatItem
              ? chatItem.timestamp
                  .replace(/ /g, "-")
                  .replace(/:/g, "-")
                  .replace(/,/g, "")
              : new Date().toLocaleString().replace(/[^0-9]/g, "");

            const fileName = chatItem
              ? `${chatItem.role}-${ts}.${fileExtension}`
              : `${ts}.${fileExtension}`;
            return (
              <>
                <br />
                <div className="code-block" ref={codeBlockRef}>
                  <div className="code-title">
                    <IconButton
                      onClick={() => {
                        if (codeBlockRef.current) {
                          const actualCode =
                            codeBlockRef.current.querySelector("code");
                          clipboardCopy(actualCode.innerText);
                        }
                      }}
                    >
                      <ContentCopyIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => {
                        if (codeBlockRef.current) {
                          const actualCode =
                            codeBlockRef.current.querySelector("code");

                          const element = document.createElement("a");
                          const file = new Blob([actualCode.innerText], {
                            type: "text/plain;charset=utf-8",
                          });
                          element.href = URL.createObjectURL(file);

                          element.download = fileName;
                          document.body.appendChild(element);
                          element.click();
                        }
                      }}
                    >
                      <DownloadIcon />
                    </IconButton>
                    {fileName} | {language}
                  </div>
                  <div className="code-container">
                    {language in langMap ? (
                      <SyntaxHighlighter
                        {...props}
                        children={children}
                        language={language}
                        PreTag="div"
                        style={a11yDark}
                      />
                    ) : (
                      <code className={"code-block"} {...props}>
                        {children}
                      </code>
                    )}
                  </div>
                </div>
                <br />
              </>
            );
          },
        }}
      />
    </>
  );
}
