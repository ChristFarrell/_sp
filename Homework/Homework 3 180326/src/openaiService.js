const GROQ_API_KEY_STORAGE = "groq_api_key";

export const saveApiKey = (key) => {
  localStorage.setItem(GROQ_API_KEY_STORAGE, key);
};

export const getApiKey = () => {
  return localStorage.getItem(GROQ_API_KEY_STORAGE) || "";
};

export const clearApiKey = () => {
  localStorage.removeItem(GROQ_API_KEY_STORAGE);
};

export const testApiKey = async (apiKey) => {
  try {
    const response = await fetch("https://api.groq.com/openai/v1/models", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.error?.message || `Error: ${response.status}`,
      };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const generateMealDetails = async (
  mealName,
  language = "zh",
  apiKey,
) => {
  if (!apiKey) {
    throw new Error("No API key - Please enter your Groq API key");
  }

  const languagePrompts = {
    en: `You are a professional chef. For the dish "${mealName}", generate description and cooking steps. Respond ONLY with valid JSON: {"description": "Your description", "steps": ["Step 1", "Step 2"]}`,
    id: `Kamu adalah chef profesional. Untuk hidangan "${mealName}", hasilkan deskripsi dan langkah memasak. Respon HANYA dengan JSON valid: {"description": "Deskripsi Anda", "steps": ["Langkah 1", "Langkah 2"]}`,
    zh: `你是一位專業廚師。對於菜餚"${mealName}"，請生成描述和烹飪步驟。只回應有效JSON：{"description": "您的描述", "steps": ["步驟1", "步驟2"]}`,
  };

  const prompt = languagePrompts[language] || languagePrompts.zh;

  try {
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: prompt }],
          temperature: 1.5,
          max_tokens: 8000,
        }),
      },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error?.message || `API Error: ${response.status}`,
      );
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content?.trim();

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0]);
      return {
        description: result.description || "",
        steps: result.steps || [],
      };
    }

    throw new Error("Invalid response format from AI");
  } catch (error) {
    console.error("Groq API Error:", error);
    throw error;
  }
};

export const generateHealthyMeal = async (
  mealType,
  language = "zh",
  apiKey,
) => {
  if (!apiKey) {
    throw new Error("No API key - Please enter your Groq API key");
  }

  const mealInfo = {
    breakfast: {
      range: "300-450",
      protein: "12-20g",
      carbs: "35-55g",
      fat: "10-18g",
      fiber: "3-7g",
      type: "RINGAN/SOUP/PORRIDGE",
    },
    lunch: {
      range: "500-700",
      protein: "25-40g",
      carbs: "50-70g",
      fat: "18-28g",
      fiber: "6-12g",
      type: "MAIN DISH",
    },
    dinner: {
      range: "500-750",
      protein: "30-45g",
      carbs: "45-65g",
      fat: "20-30g",
      fiber: "6-12g",
      type: "MAIN DISH",
    },
  };

  const info = mealInfo[mealType] || mealInfo.breakfast;

  const isBreakfast = mealType === "breakfast";

  const prompts = {
    en: isBreakfast
      ? `You are picking a RANDOM ${info.type} for BREAKFAST (morning meal - must be LIGHT and EASY to digest).

BREAKFAST INDONESIAN (pick ONE randomly):
1. Bubur ayam jakarta - chicken rice porridge with toppings
2. Soto ayam bening - clear chicken soup with rice
3. Bakso kuah - beef meatball soup
4. Lontong sayur padang - rice cake with vegetable soup
5. Ketoprak jakarta - rice cake with peanut sauce
6. Mie kuah sederhana - simple noodle soup
7. Bihun kuah ayam - rice noodle chicken soup
8. Sup wortel telur - carrot egg drop soup
9. Sup kembang tahu - tofu skin soup
10. Sup ceker ayam - chicken feet soup
11. Sup bayam jahe - spinach ginger soup
12. Sop ayam kampung - free-range chicken soup
13. Tekwan bogor - fish ball soup with sweet potato
14. Cuanki bandung - tofu and meatball soup snack
15. Lakso lamongan - spicy sweet noodle soup

BREAKFAST CHINESE (pick ONE randomly):
1. Tim ayam hongkong - steamed chicken with rice
2. Bubur ayam konghu - HK-style congee
3. Pangsit kuah - wonton noodle soup
4. Sup tahu jajanan - street-style tofu soup
5. Tim tahu telur - steamed tofu egg
6. Sup sayuran hongkong - HK-style vegetable soup
7. Bakpao ayam kukus - steamed chicken bun
8. Lo Mai Gai - chicken rice dumpling
9. Tauge goreng - stir-fried bean sprouts

CRITICAL RULES:
- MUST pick from BREAKFAST list ONLY (numbers 1-24)
- Use current timestamp millisecond to pick: (timestamp % 24) + 1
- NEVER pick kangkung/vegetable stir-fry for breakfast!
- Breakfast must be soup, porridge, or steamed dish

Respond ONLY with valid JSON (no other text):
{"name":"Dish name","description":"4-5 sentence description","steps":["Step 1 with ingredients","Step 2 with measurements","Step 3 with time","Step 4 with visual cue","Step 5","Step 6"],"calories":${Math.round((info.range.split("-")[0] + info.range.split("-")[1]) / 2)},"protein":${Math.round((parseInt(info.protein) + parseInt(info.protein.split("-")[1])) / 2)},"carbs":45,"fat":15,"fiber":5}`
      : `You are picking a RANDOM ${info.type} for ${mealType.toUpperCase()} from Indonesian or Chinese cuisine ONLY. NO Western, NO vegetarian stir-fry.

${mealType === "lunch" ? "LUNCH" : "DINNER"} INDONESIAN (pick ONE randomly):
1. Nasi goreng sehat - healthy fried rice
2. Rendang ayam sederhana - chicken rendang
3. Gado-gado jakarta - Jakarta salad with peanut
4. Soto betawi susu - betawi milk chicken soup
5. Nasi uduk komplit - complete coconut rice
6. Capcay goreng spesial - special stir-fried vegetables
7. Mie Aceh goreng - aceh fried noodles
8. Mie kangkung medan - medan kangkung noodles
9. Rendang tahu tempe - tofu tempe rendang
10. Tongseng kambing - goat meat stew
11. Rawon surabaya - surabaya black soup
12. Gudeg jogja - jogja young papaya stew
13. Nasi campur jogja - jogja mixed rice
14. Sate madura asli - madura satay
15. Ayam kecap mentega - soy butter chicken
16. Kare ayam simple - simple chicken curry
17. Opor ayam kuning - yellow chicken coconut
18. Brongkos yogya - yogya dark soup
19. Empal gentong - soup with fried beef
20. Semur daging betawi - betawi beef stew
21. Pepes ikan tongkol - spiced tuna in banana leaf
22. Tum ayam woku - woku steamed chicken
23. Lontong sayur padang - padang rice cake veg
24. Bakso sapi jumbo - jumbo beef meatballs
25. Tekwan bogor - bogor fish ball soup
26. Chicken katsu teriyaki - teriyaki chicken cutlet
27. Cincane ikan bandeng - milkfish in tamarind
28. Pallu marante - fish in turmeric
29. Sambal terong balado - eggplant with chili
30. Tumis buncis tempe - stir-fried green beans

${mealType === "lunch" ? "LUNCH" : "DINNER"} CHINESE (pick ONE randomly):
1. Fu yung hai sehat - healthy芙蓉
2. Sapo tahu ayam - tofu pot chicken
3. Sapo tahu seafood - seafood tofu pot
4. Rolade ayam tumis - chicken roll stir-fry
5. Kwetiauw siram sapi - beef sauce flat noodle
6. Nasigoreng oriental - oriental fried rice
7. Lumpia goreng renyah - crispy spring roll
8. Tim ayam rempah - herb steamed chicken
9. Cah pokcoy tofu - stir-fried bok choy tofu
10. Fu zhou fish head - fuzhou fish head
11. Tim ikan steam - steamed fish
12. Bistik ayam sauce - chicken steak sauce
13. Sup pangang鸭子 - herbal duck soup
14. Asinan betawi - betawi pickled vegetables

CRITICAL RULES:
- MUST pick from LUNCH/DINNER list ONLY (numbers 1-44)
- Use current timestamp millisecond: (timestamp % 44) + 1
- NO kangkung, NO leafy vegetable stir-fry for main meals!
- Must be protein-rich or rice/noodle dish

Respond ONLY with valid JSON (no other text):
{"name":"Dish name","description":"4-5 sentence description","steps":["Step 1 with ingredients","Step 2 with measurements","Step 3 with time","Step 4 with visual cue","Step 5","Step 6"],"calories":500,"protein":30,"carbs":55,"fat":20,"fiber":7}`,

    id: isBreakfast
      ? `Kamu memilih menu ${info.type} untuk SARAPAN PAGI - harus RINGAN dan MUDAH dicerna.

MENU SARAPAN INDONESIA (pilih SATU secara acak):
1. Bubur ayam jakarta - bubur nasi ayam dengan topping
2. Soto ayam bening - sup ayam bening dengan nasi
3. Bakso kuah - sup bakso sapi
4. Lontong sayur padang - ketupat dengan sayur padang
5. Ketoprak jakarta - lontong dengan saus kacang
6. Mie kuah sederhana - sup mie sederhana
7. Bihun kuah ayam - sup bihun ayam
8. Sup wortel telur - sup wortel kocokan telur
9. Sup kembang tahu - sup kembang tahu
10. Sup ceker ayam - sup ceker ayam
11. Sup bayam jahe - sup bayam jahe
12. Sop ayam kampung - sup ayam kampung
13. Tekwan bogor - sup bakso ikan ubi
14. Cuanki bandung - sup tahu bakso
15. Lakso lamongan - sup mie manis pedas

MENU SARAPAN CHINA (pilih SATU secara acak):
1. Tim ayam hongkong - ayam kukus nasi
2. Bubur ayam konghu - bubur estilo HK
3. Pangsit kuah - sup pangsit mie
4. Sup tahu jajanan - sup tahu kaki lima
5. Tim tahu telur - tahu kukus telur
6. Sup sayuran hongkong - sup sayuran estilo HK
7. Bakpao ayam kukus - bakpao ayam steam
8. Lo Mai Gai - dimsum ayam nasi
9. Tauge goreng - tumis tauge

ATURAN PENTING:
- WAJIB pilih dari daftar SARAPAN (nomor 1-24)
- Gunakan timestamp untuk random: (timestamp % 24) + 1
- JANGAN pilih kangkung/tumisan sayur untuk sarapan!
- Sarapan harus sup, bubur, atau makanan kukus

Respon HANYA dengan JSON valid (tanpa teks lain):
{"name":"Nama hidangan","description":"Deskripsi 4-5 kalimat","steps":["Langkah 1","Langkah 2","Langkah 3","Langkah 4","Langkah 5","Langkah 6"],"calories":380,"protein":18,"carbs":45,"fat":12,"fiber":5}`
      : `Kamu memilih menu ${info.type} untuk ${mealType === "lunch" ? "MAKAN SIANG" : "MAKAN MALAM"} dari masakan Indonesia atau China SAJA. BUKAN Western, BUKAN tumisan sayur.

${mealType === "lunch" ? "MAKAN SIANG" : "MAKAN MALAM"} INDONESIA (pilih SATU secara acak):
1. Nasi goreng sehat - nasi goreng rendah minyak
2. Rendang ayam sederhana - rendang ayam santan
3. Gado-gado jakarta - salad dengan bumbu kacang
4. Soto betawi susu - soto dengan susu
5. Nasi uduk komplit - nasi uduk dengan lauk
6. Capcay goreng spesial - tumisan sayuran spesial
7. Mie Aceh goreng - mie goreng aceh
8. Mie kangkung medan - mie kangkung medan
9. Rendang tahu tempe - rendang tahu tempe
10. Tongseng kambing - gulai kambing
11. Rawon surabaya - sup hitam khas surabaya
12. Gudeg jogja - gulai nangka muda jogja
13. Nasi campur jogja - nasi campur jogja
14. Sate madura asli - sate ayam madura
15. Ayam kecap mentega - ayam kecap manis
16. Kare ayam simple - kari ayam sederhana
17. Opor ayam kuning - opor ayam kuning
18. Brongkos yogya - brongkos khas yogya
19. Empal gentong - empal kuah
20. Semur daging betawi - semur daging jakarta
21. Pepes ikan tongkol - ikan pepes bumbu kuning
22. Tum ayam woku - ayam woku kukus
23. Lontong sayur padang - lontong sayur padang
24. Bakso sapi jumbo - bakso sapi besar
25. Tekwan bogor - bakso ikan ubi
26. Chicken katsu teriyaki - ayam katsu teriyaki
27. Cincane ikan bandeng - bandeng cincang
28. Pallu marante - ikan kuah kunyit
29. Sambal terong balado - terong sambal balado
30. Tumis buncis tempe - tumis buncis tempe

${mealType === "lunch" ? "MAKAN SIANG" : "MAKAN MALAM"} CHINA (pilih SATU secara acak):
1. Fu yung hai sehat -芙蓉 sehat
2. Sapo tahu ayam - sapo tahu ayam
3. Sapo tahu seafood - sapo tahu seafood
4. Rolade ayam tumis - rolade ayam tumis
5. Kwetiauw siram sapi - kwetiauw siram sapi
6. Nasigoreng oriental - nasi goreng oriental
7. Lumpia goreng renyah - lumpia renyah
8. Tim ayam rempah - ayam kukus rempah
9. Cah pokcoy tofu - tumis pokcoy tofu
10. Fu zhou fish head - kepala ikan fuzhou
11. Tim ikan steam - ikan kukus
12. Bistik ayam sauce - bistik ayam saus
13. Sup pangang bebek - sup bebek herbal
14. Asinan betawi - asinan jakarta

ATURAN PENTING:
- WAJIB pilih dari daftar MAKAN SIANG/MALAM (nomor 1-44)
- Gunakan timestamp untuk random: (timestamp % 44) + 1
- JANGAN pilih kangkung/tumisan sayur hijau untuk makan berat!
- Harus hidangan berprotein atau nasi/mie

Nutrisi:
- ${info.range} kalori
- Protein: ${info.protein}
- Karbohidrat: ${info.carbs}
- Lemak: ${info.fat}
- Serat: ${info.fiber}

LARANGAN: salmon, quinoa, pasta, wrap, oats, smoothie, yogurt bowl, Mediterranean, Greek

Respon HANYA dengan JSON valid (tanpa teks lain):
{"name":"Nama hidangan","description":"Deskripsi 4-5 kalimat","steps":["Langkah 1","Langkah 2","Langkah 3","Langkah 4","Langkah 5","Langkah 6"],"calories":550,"protein":35,"carbs":60,"fat":22,"fiber":8}`,

    zh: isBreakfast
      ? `你正在為早餐選擇一道 ${info.type} - 必須是輕盈且易消化的。

早餐印尼菜（隨機選擇一道）：
1. 雅加達雞肉粥 - 雞肉米粥配配料
2. 清燉雞肉梭托 - 雞肉湯配米飯
3. 肉丸湯 - 牛肉肉丸湯
4. 巴東蔬菜湯粿 - 蔬菜湯配米粿
5. 雅加達Ketoprak - 米粿配花生醬
6. 簡單湯麵 - 簡單的湯麵
7. 米粉雞肉湯 - 米粉雞肉湯
8. 胡蘿蔔蛋花湯 - 胡蘿蔔蛋湯
9. 豆腐皮湯 - 豆腐皮湯
10. 雞腳湯 - 雞腳湯
11. 菠菜生薑湯 - 菠菜生薑湯
12. 鄉村雞湯 - 放養雞湯
13. 茂物魚丸湯 - 魚丸地瓜湯
14. 萬隆豆干 - 豆干肉丸湯
15. 拉索南夢 - 辣甜湯麵

早餐中國菜（隨機選擇一道）：
1. 香港蒸雞 - 蒸雞配飯
2. 香港粥 - 港式粥
3. 雲吞湯 - 雲吞湯麵
4. 街頭豆腐湯 - 街頭豆腐湯
5. 蒸蛋豆腐 - 蒸豆腐蛋
6. 香港蔬菜湯 - 港式蔬菜湯
7. 蒸雞肉包 - 蒸雞肉包子
8. 糯米雞 - 雞肉米飯糰
9. 炒豆芽 - 炒豆芽

重要規則：
- 必須從早餐列表中選擇（1-24號）
- 使用時間戳隨機：(timestamp % 24) + 1
- 早餐不要選擇空心菜/蔬菜炒！
- 早餐必須是湯、粥或蒸菜

只回應有效JSON：
{"name":"菜餚名稱","description":"4-5句描述","steps":["步驟1","步驟2","步驟3","步驟4","步驟5","步驟6"],"calories":380,"protein":18,"carbs":45,"fat":12,"fiber":5}`
      : `你正在為${mealType === "lunch" ? "午餐" : "晚餐"}選擇一道 ${info.type}，只來自印尼或中國料理。不是西方菜，不是素菜炒。

${mealType === "lunch" ? "午餐" : "晚餐"}印尼菜（隨機選擇一道）：
1. 健康炒飯 - 低油炒飯
2. 簡單咖喱雞肉 - 椰奶咖喱雞
3. 雅加達沙拉加多加多 - 花生醬沙拉
4. 牛奶梭托貝塔維 - 牛奶梭托
5. 完整椰奶飯 - 完整椰奶飯配菜
6. 特色炒蔬菜 - 特色炒蔬菜
7. 亞齊炒麵 - 亞齊炒麵
8. 棉蘭空心菜麵 - 棉蘭空心菜麵
9. 豆腐天貝 rendang - 豆腐天貝咖喱
10. 羊肉燉 - 山羊肉燉
11. 泗水黑湯 - 泗水黑湯
12. 日惹Gudeg - 日惹年輕木瓜燉
13. 日惹混合飯 - 日惹混合飯
14. 蜜餞烤肉串 - 蜜餞烤肉串
15. 奶油醬油雞 - 甜醬油雞
16. 簡單咖喱雞 - 簡單咖喱雞
17. 薑黃雞 - 薑黃椰奶雞
18. 日惹Brongkos - 日惹深色湯
19. 椰奶牛肉湯 - 椰奶牛肉湯
20. 雅加達牛肉燉 - 雅加達牛肉燉
21. 鮪魚烤魚 - 香蕉葉鮪魚
22. 瓦庫雞 - 瓦庫蒸雞
23. 巴東蔬菜湯粿 - 巴東蔬菜湯粿
24. 大肉丸 - 大牛肉丸
25. 茂物魚丸湯 - 茂物魚丸湯
26. 照燒雞排 - 照燒雞排
27. 銀鯧魚 - 銀鯧魚酸橙
28. 薑黃魚 - 薑黃魚
29. 辣椒茄子 - 辣椒茄子
30. 扁豆天貝炒 - 扁豆天貝炒

${mealType === "lunch" ? "午餐" : "晚餐"}中國菜（隨機選擇一道）：
1. 健康芙蓉 - 健康芙蓉
2. 豆腐煲雞 - 豆腐煲雞
3. 海鮮豆腐煲 - 海鮮豆腐煲
4. 蒸雞肉卷 - 蒸雞肉卷
5. 肉汁米粉 - 肉汁米粉
6. 東方炒飯 - 東方炒飯
7. 脆炸春捲 - 脆炸春捲
8. 香草蒸雞 - 香草蒸雞
9. 炒白菜豆腐 - 炒白菜豆腐
10. 福州魚頭 - 福州魚頭
11. 蒸魚 - 蒸魚
12. 醬汁雞排 - 醬汁雞排
13. 草藥鴨湯 - 草藥鴨湯
14. 雅加達酸菜 - 雅加達酸菜

重要規則：
- 必須從午餐/晚餐列表中選擇（1-44號）
- 使用時間戳隨機：(timestamp % 44) + 1
- 不要選擇空心菜/綠葉蔬菜炒作為主餐！
- 必須是富含蛋白質或米飯/麵條的菜餚

營養：
- ${info.range}卡路里
- 蛋白質：${info.protein}
- 碳水化合物：${info.carbs}
- 脂肪：${info.fat}
- 纖維：${info.fiber}

禁止：三文魚、藜麵、義大利麵、卷餅、燕麥、冰沙、優格碗

只回應有效JSON：
{"name":"菜餚名稱","description":"4-5句描述","steps":["步驟1","步驟2","步驟3","步驟4","步驟5","步驟6"],"calories":550,"protein":35,"carbs":60,"fat":22,"fiber":8}`,
  };

  const timestamp = Date.now();
  const seed = timestamp % (isBreakfast ? 24 : 44) + 1;

  const prompt = `${prompts[language] || prompts.en}

  
CRITICAL: Use seed=${seed} to deterministically pick ONE dish. Calculate: dish_number = (${seed} + ${timestamp}) % TOTAL_DISHES + 1. Respond ONLY with JSON.`;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 1.5,
        max_tokens: 8000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error?.message || `API Error: ${response.status}`,
      );
    }

    const data = await response.json();
    let content = data.choices[0]?.message?.content?.trim();

    let result;
    let parseSuccess = false;

    // Try 1: Direct parse
    try {
      result = JSON.parse(content);
      parseSuccess = true;
    } catch (e1) {}

    // Try 2: Find JSON between { and }
    if (!parseSuccess) {
      try {
        const match = content.match(/\{[\s\S]*\}/);
        if (match) {
          result = JSON.parse(match[0]);
          parseSuccess = true;
        }
      } catch (e2) {}
    }

    // Try 3: Find first { and last }
    if (!parseSuccess) {
      try {
        const firstBrace = content.indexOf("{");
        const lastBrace = content.lastIndexOf("}");
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          const jsonStr = content.substring(firstBrace, lastBrace + 1);
          result = JSON.parse(jsonStr);
          parseSuccess = true;
        }
      } catch (e3) {}
    }

    if (!parseSuccess) {
      console.log("Raw content:", content);
      throw new Error("Invalid JSON response from AI");
    }

    return {
      name: result.name || "",
      description: result.description || "",
      steps: result.steps || [],
      calories: Number(result.calories) || 0,
      protein: Number(result.protein) || 0,
      carbs: Number(result.carbs) || 0,
      fat: Number(result.fat) || 0,
      fiber: Number(result.fiber) || 0,
      aiGenerated: true,
    };
  } catch (error) {
    console.error("Groq API Error:", error);
    throw error;
  }
};
