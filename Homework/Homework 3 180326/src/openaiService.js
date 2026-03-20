const GROQ_API_KEY_STORAGE = 'groq_api_key';

export const saveApiKey = (key) => {
  localStorage.setItem(GROQ_API_KEY_STORAGE, key);
};

export const getApiKey = () => {
  return localStorage.getItem(GROQ_API_KEY_STORAGE) || '';
};

export const clearApiKey = () => {
  localStorage.removeItem(GROQ_API_KEY_STORAGE);
};

export const generateMealDetails = async (mealName, language = 'zh', apiKey) => {
  if (!apiKey) {
    throw new Error('No API key');
  }

  const languagePrompts = {
    en: {
      prompt: `You are a professional chef. For the dish "${mealName}", generate:
1. A brief description (2-3 sentences about the dish, its origin, and key ingredients)
2. Cooking steps (as many as needed, typically 4-8 steps)

Respond ONLY with valid JSON in this exact format:
{"description": "Your description here", "steps": ["Step 1", "Step 2", "Step 3", "Step 4", ...]}`
    },
    id: {
      prompt: `Kamu adalah chef profesional. Untuk hidangan "${mealName}", hasilkan:
1. Deskripsi singkat (2-3 kalimat tentang hidangan, asal, dan bahan utama)
2. Langkah memasak (sesuai kebutuhan, biasanya 4-8 langkah)

Respon HANYA dengan JSON valid dalam format ini:
{"description": "Deskripsi Anda di sini", "steps": ["Langkah 1", "Langkah 2", "Langkah 3", "Langkah 4", ...]}`
    },
    zh: {
      prompt: `你是一位專業廚師。對於菜餚"${mealName}"，請生成：
1. 簡短描述（2-3句話關於菜餚、其起源和主要食材）
2. 烹飪步驟（根據需要，通常4-8個步驟）

只回應有效JSON格式：
{"description": "您的描述", "steps": ["步驟1", "步驟2", "步驟3", "步驟4", ...]}`
    }
  };

  const lang = languagePrompts[language] || languagePrompts.zh;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'user', content: lang.prompt }
        ],
        temperature: 0.8,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `API Error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content?.trim();

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0]);
      return {
        description: result.description || '',
        steps: result.steps || []
      };
    }

    throw new Error('Invalid response format');
  } catch (error) {
    console.error('Groq API Error:', error);
    throw error;
  }
};
