import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import 'highlight.js/styles/github-dark.css';

const MarkdownRenderer = ({ content, className = '' }) => {
  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight, rehypeRaw]}
        components={{
          // Custom styling for different elements
          h1: ({ children }) => (
            <h1 className="markdown-h1">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="markdown-h2">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="markdown-h3">{children}</h3>
          ),
          h4: ({ children }) => (
            <h4 className="markdown-h4">{children}</h4>
          ),
          h5: ({ children }) => (
            <h5 className="markdown-h5">{children}</h5>
          ),
          h6: ({ children }) => (
            <h6 className="markdown-h6">{children}</h6>
          ),
          p: ({ children }) => (
            <p className="markdown-p">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="markdown-ul">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="markdown-ol">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="markdown-li">{children}</li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="markdown-blockquote">{children}</blockquote>
          ),
          code: ({ inline, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            return !inline ? (
              <pre className="markdown-pre">
                <code className={className} {...props}>
                  {children}
                </code>
              </pre>
            ) : (
              <code className="markdown-inline-code" {...props}>
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="markdown-pre">{children}</pre>
          ),
          table: ({ children }) => (
            <div className="markdown-table-wrapper">
              <table className="markdown-table">{children}</table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="markdown-thead">{children}</thead>
          ),
          tbody: ({ children }) => (
            <tbody className="markdown-tbody">{children}</tbody>
          ),
          tr: ({ children }) => (
            <tr className="markdown-tr">{children}</tr>
          ),
          th: ({ children }) => (
            <th className="markdown-th">{children}</th>
          ),
          td: ({ children }) => (
            <td className="markdown-td">{children}</td>
          ),
          a: ({ href, children }) => (
            <a 
              href={href} 
              target="_blank" 
              rel="noopener noreferrer"
              className="markdown-link"
            >
              {children}
            </a>
          ),
          img: ({ src, alt, ...props }) => (
            <img 
              src={src} 
              alt={alt} 
              className="markdown-img"
              {...props}
            />
          ),
          hr: () => (
            <hr className="markdown-hr" />
          ),
          strong: ({ children }) => (
            <strong className="markdown-strong">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="markdown-em">{children}</em>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
