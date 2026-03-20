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

export const testApiKey = async (apiKey) => {
  try {
    const response = await fetch('https://api.groq.com/openai/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { success: false, error: errorData.error?.message || `Error: ${response.status}` };
    }
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const generateMealDetails = async (mealName, language = 'zh', apiKey) => {
  if (!apiKey) {
    throw new Error('No API key - Please enter your Groq API key');
  }

  const languagePrompts = {
    en: {
      prompt: `You are a professional chef. For the dish "${mealName}", generate:

1. A detailed description (write a full paragraph, 3-5 sentences about the dish, its origin, cultural background, flavor profile, and what makes it special. Be descriptive and engaging.)

2. Cooking steps - Write as many detailed steps as needed to properly cook this dish. Each step should be clear, specific, and easy to follow for a home cook. Include tips like temperature, timing, and visual cues to know when it's done.

Respond ONLY with valid JSON:
{"description": "Your detailed paragraph description here", "steps": ["Detailed step 1", "Detailed step 2", "Detailed step 3", ... (as many as needed)]}`
    },
    id: {
      prompt: `Kamu adalah chef profesional. Untuk hidangan "${mealName}", hasilkan:

1. Deskripsi detail (tulis paragraf lengkap, 3-5 kalimat tentang hidangan, asal, latar belakang budaya, profil rasa, dan apa yang membuatnya spesial. Jadilah deskriptif dan menarik.)

2. Langkah memasak - Tuliskan sebanyak mungkin langkah detail yang dibutuhkan untuk memasak hidangan ini dengan benar. Setiap langkah harus jelas, spesifik, dan mudah diikuti. Termasuk tips seperti suhu, waktu, dan tanda visual untuk mengetahui kapan sudah selesai.

Respon HANYA dengan JSON valid:
{"description": "Deskripsi paragraf detail Anda di sini", "steps": ["Langkah detail 1", "Langkah detail 2", "Langkah detail 3", ... (sebanyak yang diperlukan)]}`
    },
    zh: {
      prompt: `你是一位專業廚師。對於菜餚"${mealName}"，請生成：

1. 詳細描述（撰寫完整段落，3-5句話關於菜餚、其起源，文化背景、風味特徵，以及使其與眾不同的原因。請生動且引人入勝地描述。）

2. 烹飪步驟 - 撰寫盡可能多的詳細步驟來正確烹飪這道菜。每個步驟都應該清晰、具體，讓家庭廚師容易follow。包括溫度，時間和視覺提示等技巧，以了解何時完成。

只回應有效JSON：
{"description": "您詳細的段落描述", "steps": ["詳細步驟1", "詳細步驟2", "詳細步驟3", ... (根據需要)]}`
    }
  };

  const lang = languagePrompts[language] || languagePrompts.zh;

  console.log('Calling Groq API with key:', apiKey.substring(0, 10) + '...');
  
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'user', content: lang.prompt }
        ],
        temperature: 0.8,
        max_tokens: 2000
      })
    });

    console.log('Groq Response Status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Groq Error:', errorData);
      throw new Error(errorData.error?.message || `API Error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Groq Response Data:', data);
    
    const content = data.choices[0]?.message?.content?.trim();
    console.log('Content:', content);

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0]);
      return {
        description: result.description || '',
        steps: result.steps || []
      };
    }

    throw new Error('Invalid response format from AI');
  } catch (error) {
    console.error('Groq API Error:', error);
    throw error;
  }
};
