import React from 'react';

export const InstructionPanel: React.FC = () => {
  return (
    <div className="mt-4 p-4 bg-gray-900/50 border border-gray-700 rounded-lg text-sm text-gray-400">
      <h4 className="font-semibold text-gray-300 mb-2">How to find the CSS Selector:</h4>
      <ol className="list-decimal list-inside space-y-1">
        <li>Go to the Mentimeter poll page in your browser.</li>
        <li>Right-click on the answer choice you want to automate.</li>
        <li>Select "Inspect" from the context menu to open Developer Tools.</li>
        <li>In the Elements panel, you will see the HTML for that button or input.</li>
        <li>Look for a unique attribute. For radio buttons, this is often the <code className="bg-gray-700 px-1 rounded text-xs">value</code> inside an <code className="bg-gray-700 px-1 rounded text-xs">&lt;input&gt;</code> tag.</li>
        <li>Create a selector based on that attribute. For example, if you see <code className="bg-gray-700 px-1 rounded text-xs">value="some-unique-id"</code>, your selector will be <code className="bg-gray-700 px-1 rounded text-xs">input[value="some-unique-id"]</code>.</li>
        <li>
          For the HTML you recently shared, the correct selector is:
          <br />
          <code className="bg-gray-700 px-2 py-1 mt-1 inline-block rounded text-xs">input[value="0199f7d4-7076-7017-83d7-c929aea0d14b"]</code>
        </li>
      </ol>
      <div className="mt-3">
        <p className="text-xs text-gray-500">A good selector is crucial for the script to work reliably.</p>
      </div>
    </div>
  );
};