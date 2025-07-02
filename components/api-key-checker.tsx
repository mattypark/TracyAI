"use client"

import { useState, useEffect } from 'react';

export function ApiKeyChecker() {
  const [apiKeyStatus, setApiKeyStatus] = useState<string>('Checking...');

  useEffect(() => {
    // Check if OpenAI API key is available in the browser
    const openaiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    
    if (openaiKey) {
      setApiKeyStatus('OpenAI API key is available ✅');
      console.log('OpenAI API key is available:', openaiKey.substring(0, 5) + '...');
    } else {
      setApiKeyStatus('OpenAI API key is missing ❌');
      console.error('OpenAI API key is missing!');
    }
    
    console.log('Supabase URL:', supabaseUrl);
  }, []);

  return (
    <div className="p-4 bg-yellow-100 dark:bg-yellow-900 rounded-md mb-4">
      <h3 className="font-medium">Environment Check</h3>
      <p>{apiKeyStatus}</p>
    </div>
  );
} 