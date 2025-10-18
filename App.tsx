import React, { useState, useCallback } from 'react';
import { Step } from './types';
import { InstructionPanel } from './components/InstructionPanel';
import { CodeBlock } from './components/CodeBlock';
import { CheckCircleIcon, ClipboardIcon, ArrowRightIcon, ArrowLeftIcon } from './components/icons';

const App: React.FC = () => {
  const [step, setStep] = useState<Step>(Step.Url);
  const [url, setUrl] = useState<string>('https://www.menti.com/alykdaw2699w');
  const [selector, setSelector] = useState<string>('');
  const [count, setCount] = useState<number>(10);
  const [script, setScript] = useState<string>('');

  const generateScript = useCallback(() => {
    const generatedScript = `
const puppeteer = require('puppeteer');

// --- User Configuration ---
const MENTI_URL = '${url}';
const CHOICE_SELECTOR = '${selector.replace(/'/g, "\\'")}';
const VOTE_COUNT = ${count};
// --------------------------

// --- Advanced Configuration ---
// Set to 'new' for the new headless mode, 'true' for old headless, false to see the browser UI.
const HEADLESS_MODE = 'new';
// Delay in milliseconds between starting each vote instance.
const VOTE_DELAY_MS = 250;
// --------------------------

async function castVote(instanceNum) {
  console.log(\`[Vote \${instanceNum}] Launching browser...\`);
  let browser;
  
  try {
    browser = await puppeteer.launch({ headless: HEADLESS_MODE });
    // Create a new incognito-like browser context for each vote to ensure isolation.
    const context = await browser.createBrowserContext();
    const page = await context.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36');

    console.log(\`[Vote \${instanceNum}] Navigating to Menti page...\`);
    await page.goto(MENTI_URL, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Attempt to accept cookie banner if it appears
    try {
        const acceptButton = await page.waitForSelector('button#onetrust-accept-btn-handler', { timeout: 5000 });
        if (acceptButton) {
          await acceptButton.click();
          console.log(\`[Vote \${instanceNum}] Accepted cookie consent.\`);
          // Wait for any overlays to disappear
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
    } catch (e) {
        console.log(\`[Vote \${instanceNum}] No cookie banner found or it timed out.\`);
    }

    console.log(\`[Vote \${instanceNum}] Searching for choice with selector: \${CHOICE_SELECTOR}\`);
    // Wait for the selector to appear in the DOM. It might not be "visible" if it's a styled radio/checkbox.
    const choiceElement = await page.waitForSelector(CHOICE_SELECTOR, { timeout: 20000 });

    if (!choiceElement) {
      throw new Error('Could not find the choice element on the page.');
    }

    // Use page.evaluate to click the element via the DOM. This is more reliable for
    // custom styled inputs that might not be considered "clickable" by Puppeteer's default checks.
    await page.evaluate(el => el.click(), choiceElement);
    console.log(\`[Vote \${instanceNum}] Clicked the choice button.\`);
    
    // A confirmation/submit button might appear after selection
    try {
      const submitButton = await page.waitForSelector('button[type="submit"]', { visible: true, timeout: 3000 });
      if (submitButton) {
        await submitButton.click();
        console.log(\`[Vote \${instanceNum}] Clicked the submit button.\`);
      }
    } catch (e) {
      console.log(\`[Vote \${instanceNum}] No separate submit button found, assuming vote is cast.\`);
    }

    // Wait a moment for confirmation
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log(\`[Vote \${instanceNum}] ✅ Vote cast successfully!\`);

  } catch (error) {
    console.error(\`[Vote \${instanceNum}] ❌ An error occurred: \${error.message}\`);
  } finally {
    if (browser) {
      await browser.close();
      console.log(\`[Vote \${instanceNum}] Browser closed.\`);
    }
  }
}

async function run() {
  console.log('--- Menti Vote Automation Script ---');
  console.log(\`Target URL: \${MENTI_URL}\`);
  console.log(\`Target Selector: \${CHOICE_SELECTOR}\`);
  console.log(\`Number of Votes: \${VOTE_COUNT}\`);
  console.log('------------------------------------\\n');

  const votePromises = [];
  for (let i = 1; i <= VOTE_COUNT; i++) {
    // Sequentially push promises with a delay to avoid overwhelming the system/network
    votePromises.push(castVote(i));
    if (i < VOTE_COUNT) {
      await new Promise(resolve => setTimeout(resolve, VOTE_DELAY_MS));
    }
  }
  
  await Promise.all(votePromises);
  
  console.log(\`\n--- All \${VOTE_COUNT} vote attempts are complete. ---\`);
}

run();
`;
    setScript(generatedScript.trim());
  }, [url, selector, count]);

  const nextStep = () => {
    if (step === Step.Count) {
      generateScript();
    }
    setStep(prev => Math.min(prev + 1, Object.keys(Step).length / 2 - 1));
  };
  
  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 0));
  };

  const isNextDisabled = () => {
    switch (step) {
      case Step.Url:
        return !url.startsWith('http');
      case Step.Selector:
        return selector.trim() === '';
      case Step.Count:
        return count <= 0;
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch (step) {
      case Step.Url:
        return (
          <div>
            <label htmlFor="url" className="block text-sm font-medium text-gray-400 mb-2">Step 1: Enter Mentimeter URL</label>
            <input
              type="text"
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="https://www.menti.com/..."
            />
          </div>
        );
      case Step.Selector:
        return (
          <div>
            <label htmlFor="selector" className="block text-sm font-medium text-gray-400 mb-2">Step 2: Enter CSS Selector for the Answer</label>
            <input
              type="text"
              id="selector"
              value={selector}
              onChange={(e) => setSelector(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder='e.g., input[value="some-unique-id"]'
            />
            <InstructionPanel />
          </div>
        );
      case Step.Count:
        return (
          <div>
            <label htmlFor="count" className="block text-sm font-medium text-gray-400 mb-2">Step 3: How many requests?</label>
            <input
              type="number"
              id="count"
              value={count}
              min="1"
              max="1000"
              onChange={(e) => setCount(parseInt(e.target.value, 10))}
              className="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        );
      case Step.Result:
        return (
          <div>
            <h3 className="text-lg font-semibold text-green-400 mb-2 flex items-center"><CheckCircleIcon />Script Generated Successfully</h3>
            <p className="text-sm text-gray-400 mb-4">
              To run this script, you need Node.js and Puppeteer installed.
              <br />
              1. Save the code below as a file, e.g., <code className="bg-gray-700 px-1 rounded">vote.js</code>.
              <br />
              2. Open your terminal in the same directory.
              <br />
              3. Run <code className="bg-gray-700 px-1 rounded">npm install puppeteer</code>.
              <br />
              4. Run <code className="bg-gray-700 px-1 rounded">node vote.js</code>.
            </p>
            <CodeBlock code={script} />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-3xl">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white">🤖 Menti Script Generator</h1>
          <p className="text-gray-400 mt-2">Create a browser automation script in a few easy steps.</p>
        </header>

        <main className="bg-gray-800 rounded-xl shadow-2xl p-8 border border-gray-700">
          <div className="min-h-[300px]">
            {renderStep()}
          </div>
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-700">
            <button
              onClick={prevStep}
              disabled={step === Step.Url}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500 disabled:bg-gray-700 disabled:cursor-not-allowed flex items-center transition-colors"
            >
              <ArrowLeftIcon />
              <span className="ml-2">Back</span>
            </button>
            {step !== Step.Result && (
              <button
                onClick={nextStep}
                disabled={isNextDisabled()}
                className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-500 disabled:bg-blue-800 disabled:cursor-not-allowed flex items-center transition-colors"
              >
                <span className="mr-2">{step === Step.Count ? "Generate Script" : "Next"}</span>
                <ArrowRightIcon />
              </button>
            )}
          </div>
        </main>
        <footer className="text-center mt-8 text-xs text-gray-500">
          <p>This tool is for educational purposes only. Use responsibly and respect the terms of service of any website you interact with. Automated voting may be against Mentimeter's ToS.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;