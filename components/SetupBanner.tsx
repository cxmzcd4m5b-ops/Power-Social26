"use client";

import { useState, useEffect } from "react";
import { AlertCircle, CheckCircle, ExternalLink } from "lucide-react";

export default function SetupBanner() {
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    async function checkSetup() {
      try {
        const response = await fetch("/api/health");
        const data = await response.json();
        setIsConfigured(data.configured);
      } catch {
        setIsConfigured(false);
      } finally {
        setIsChecking(false);
      }
    }
    checkSetup();
  }, []);

  if (isChecking) {
    return null;
  }

  if (isConfigured) {
    return (
      <div className="max-w-4xl mx-auto mb-6 bg-green-50 border-2 border-green-200 rounded-lg p-4 flex items-center gap-3">
        <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
        <p className="text-green-800 font-medium">
          ✨ Ready to go! Upload your content to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mb-6 bg-amber-50 border-2 border-amber-300 rounded-lg p-6">
      <div className="flex items-start gap-4">
        <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
        <div className="flex-1">
          <h3 className="text-lg font-bold text-amber-900 mb-2">
            Setup Required: Add Your OpenAI API Key
          </h3>
          <p className="text-amber-800 mb-4">
            To generate AI-powered content, you need to add your OpenAI API key to the <code className="bg-amber-100 px-2 py-1 rounded">.env</code> file.
          </p>
          <div className="bg-white border border-amber-200 rounded-lg p-4 mb-4">
            <p className="text-sm font-bold text-amber-900 mb-2">Quick Steps:</p>
            <ol className="text-sm text-amber-800 space-y-1 list-decimal list-inside">
              <li>Get your key from OpenAI Platform (link below)</li>
              <li>Open the <code className="bg-amber-100 px-1 rounded">.env</code> file in your project</li>
              <li>Add: <code className="bg-amber-100 px-1 rounded">OPENAI_API_KEY=sk-your-key</code></li>
              <li>Save and refresh this page</li>
            </ol>
          </div>
          <a
            href="https://platform.openai.com/api-keys"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-amber-700 transition-colors"
          >
            Get OpenAI API Key
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
