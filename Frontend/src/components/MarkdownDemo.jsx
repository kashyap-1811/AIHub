import React from 'react';
import MarkdownRenderer from './MarkdownRenderer';

const MarkdownDemo = () => {
  const sampleMarkdown = `# React Hooks Explained

React hooks are functions that let you use state and other React features in functional components.

## Common Hooks

### 1. useState Hook
The \`useState\` hook allows you to add state to functional components:

\`\`\`javascript
import React, { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
\`\`\`

### 2. useEffect Hook
The \`useEffect\` hook lets you perform side effects in functional components:

\`\`\`javascript
import React, { useState, useEffect } from 'react';

function Example() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    document.title = \`You clicked \${count} times\`;
  });

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
\`\`\`

## Key Benefits

- **Simplified Logic**: Hooks let you split one component into smaller functions
- **Reusable State Logic**: Extract stateful logic into custom hooks
- **No Class Components**: Use functional components everywhere

## Best Practices

1. **Only call hooks at the top level** - Don't call hooks inside loops, conditions, or nested functions
2. **Only call hooks from React functions** - Call hooks from React function components or custom hooks
3. **Use multiple state variables** - Instead of merging state into one object

> **Note**: Hooks are a new addition in React 16.8. They don't contain any breaking changes.

## Table of Common Hooks

| Hook | Purpose | Example |
|------|---------|---------|
| \`useState\` | Manage state | \`const [state, setState] = useState(initial)\` |
| \`useEffect\` | Side effects | \`useEffect(() => {}, [deps])\` |
| \`useContext\` | Consume context | \`const value = useContext(MyContext)\` |
| \`useReducer\` | Complex state | \`const [state, dispatch] = useReducer(reducer, initial)\` |

---

**Happy coding!** 🚀`;

  return (
    <div className="p-4">
      <h2 className="text-primary mb-4">Markdown Rendering Demo</h2>
      <div className="bg-secondary p-4 rounded">
        <MarkdownRenderer content={sampleMarkdown} />
      </div>
    </div>
  );
};

export default MarkdownDemo;
