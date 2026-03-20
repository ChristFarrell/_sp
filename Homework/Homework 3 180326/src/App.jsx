import { useState } from 'react'
import { Sparkles, Check, RotateCcw, Utensils, BarChart3, Moon, Sun, Globe, ChevronDown } from 'lucide-react'
import MealCard from './components/MealCard'
import MealDescription from './components/MealDescription'
import NutritionChart from './components/NutritionChart'
import ApiKeySettings from './components/ApiKeySettings'
import { LanguageProvider, useLanguage } from './LanguageContext'
import { getApiKey, generateMealDetails } from './openaiService'

const mealData = {
  breakfast: [
    { name: '燕麥水果碗', description: '有機燕麥、新鮮藍莓、香蕉、奇亞籽、杏仁奶', steps: ['前一晚將燕麥和杏仁奶混合放入冰箱', '早上加入藍莓、香蕉切片和奇亞籽', '攪拌均勻即可享用'], calories: 420, protein: 15, carbs: 65, fat: 12, fiber: 8 },
    { name: '班尼迪克蛋', description: '英式馬芬、荷包蛋、培根、荷蘭醬、配沙拉', steps: ['將英式馬芬烤至金黃酥脆', '煎培根至微焦備用', '製作水波蛋，蛋白凝固蛋黃流心', '組裝：馬芬+培根+水波蛋+荷蘭醬'], calories: 520, protein: 28, carbs: 35, fat: 32, fiber: 2 },
    { name: '酪梨吐司', description: '全麥吐司、酪梨泥、太陽蛋、櫻桃番茄、芝麻', steps: ['將全麥吐司烤至微脆', '酪梨壓成泥加檸檬汁調味', '吐司抹上酪梨泥，放上太陽蛋', '撒上芝麻和切半的櫻桃番茄'], calories: 380, protein: 14, carbs: 42, fat: 18, fiber: 7 },
    { name: '法式吐司配水果', description: '厚片吐司、雞蛋、牛奶、蜂蜜、新鮮水果', steps: ['雞蛋和牛奶混合成蛋液', '吐司浸泡蛋液5分鐘', '小火煎至金黃，淋上蜂蜜', '配新鮮水果享用'], calories: 450, protein: 12, carbs: 58, fat: 16, fiber: 3 },
    { name: '日式味噌湯', description: '味噌、豆腐、海帶芽、蔥花、柴魚片', steps: ['將高湯煮沸', '加入味噌攪拌均勻', '放入豆腐塊和海帶芽', '撒上蔥花和柴魚片'], calories: 120, protein: 8, carbs: 10, fat: 5, fiber: 2 },
    { name: '優格水果碗', description: '希臘優格、蜂蜜、 granola、各式水果', steps: ['碗中倒入希臘優格', '淋上蜂蜜', '撒上 granola', '擺放各式水果'], calories: 350, protein: 18, carbs: 48, fat: 10, fiber: 5 },
    { name: '蔥油餅配豆漿', description: '手工蔥油餅、濃郁豆漿、雞蛋', steps: ['蔥油餅煎至兩面金黃酥脆', '豆漿加熱備用', '可加一顆煎蛋', '搭配豆漿一同享用'], calories: 480, protein: 16, carbs: 55, fat: 22, fiber: 3 },
    { name: '燻鮭魚貝果', description: '貝果、燻鮭魚、奶油起司、小黃瓜、刁草', steps: ['貝果烤至微溫', '塗上奶油起司', '擺上燻鮭魚切片', '放上小黃瓜片和刁草'], calories: 420, protein: 25, carbs: 42, fat: 18, fiber: 3 },
    { name: '泰式奶茶吐司', description: '厚片吐司、泰式奶茶卡士達、椰奶脆片', steps: ['製作泰式奶茶卡士達', '吐司烤至金黃', '抹上卡士達', '撒上椰奶脆片'], calories: 480, protein: 8, carbs: 62, fat: 22, fiber: 2 },
    { name: '日式玉子燒', description: '雞蛋、高湯、醬油、味醂、海苔', steps: ['雞蛋打散加入高湯和調味', '玉子燒鍋小火加熱', '分次倒入蛋液捲起', '切段搭配米飯食用'], calories: 220, protein: 14, carbs: 8, fat: 14, fiber: 0 },
    { name: '越式法包三明治', description: '越式法包、烤肉、蛋黃醬、蔬菜', steps: ['法包對半切開', '夾入烤肉和蔬菜', '塗上蛋黃醬', '切成兩段享用'], calories: 450, protein: 22, carbs: 48, fat: 20, fiber: 4 },
    { name: '韓式煎餅', description: '麵糊、蔥、海鮮、韭菜、沾醬', steps: ['將麵糊材料混合', '平底鍋小火煎至兩面金黃', '搭配沾醬', '趁熱食用最佳'], calories: 380, protein: 18, carbs: 42, fat: 16, fiber: 3 },
    { name: '澳式大早餐', description: '培根、煎蛋、烤番茄、蘑菇、烤豆', steps: ['煎培根至微焦', '煎太陽蛋', '烤番茄和蘑菇', '擺盤加上烤豆'], calories: 650, protein: 35, carbs: 38, fat: 42, fiber: 6 },
    { name: '台灣蛋餅', description: '手抓餅皮、雞蛋、蔥花、醬油膏', steps: ['餅皮煎至金黃', '打上雞蛋撒蔥花', '淋上醬油膏', '捲起切段'], calories: 380, protein: 14, carbs: 42, fat: 18, fiber: 2 },
    { name: '印式香料奶茶', description: '紅茶、牛奶、香料（豆蔻、薑、丁香）、糖', steps: ['將水和香料煮沸', '加入紅茶葉煮出茶味', '倒入牛奶繼續煮', '過濾後加糖調味'], calories: 180, protein: 6, carbs: 22, fat: 8, fiber: 0 },
    { name: '中式粥品', description: '白粥、皮蛋、瘦肉、蔥花、鹹蛋', steps: ['白粥熬煮至濃稠', '加入皮蛋和瘦肉', '撒上蔥花', '配鹹蛋享用'], calories: 320, protein: 18, carbs: 48, fat: 6, fiber: 2 },
    { name: '西班牙歐姆蛋', description: '雞蛋、馬鈴薯、洋蔥、甜椒、火腿', steps: ['馬鈴薯和洋蔥切丁煎軟', '加入甜椒和火腿', '倒入打散的雞蛋', '小火煎至凝固翻面'], calories: 420, protein: 22, carbs: 32, fat: 26, fiber: 3 },
    { name: '越南咖啡吐司', description: '法棍、煉乳、越南咖啡、奶油', steps: ['法棍切片塗奶油烤脆', '現泡越南咖啡加煉乳', '咖啡冷卻備用', '吐司配咖啡享用'], calories: 380, protein: 8, carbs: 52, fat: 16, fiber: 2 },
  ],
  lunch: [
    { name: '鮭魚沙拉碗', description: '烤鮭魚、混合生菜、藜麥、牛油果、是和風醬', steps: ['將藜麥煮熟備用', '鮭魚撒鹽胡椒烤15分鐘', '生菜洗淨鋪底，放上藜麥', '擺上烤鮭魚切片和牛油果，淋上和風醬'], calories: 580, protein: 42, carbs: 38, fat: 28, fiber: 6 },
    { name: '越式河粉', description: '越南河粉、牛肉片、豆芽、香菜、薄荷、九層塔', steps: ['牛骨熬煮高湯約2小時', '河粉燙熟放入碗中', '擺上薄切牛肉片、豆芽', '加入香菜、薄荷、九層塔，淋上熱高湯'], calories: 480, protein: 32, carbs: 55, fat: 14, fiber: 3 },
    { name: '墨西哥塔可', description: '玉米餅、雞肉絲、酪梨、番茄莎莎、酸奶油', steps: ['雞胸肉切絲用香料醃製後炒熟', '製作莎莎醬：番茄、洋蔥、香菜切丁拌勻', '玉米餅稍微加熱', '組裝：餅皮+雞肉絲+莎莎醬+酪梨泥+酸奶油'], calories: 520, protein: 35, carbs: 45, fat: 22, fiber: 6 },
    { name: '日式豬排飯', description: '炸豬排、高麗菜絲、白飯、味噌湯', steps: ['豬排裹麵包粉炸至金黃酥脆', '切成條狀', '白飯盛碗，放上豬排', '配高麗菜絲和味噌湯'], calories: 720, protein: 38, carbs: 65, fat: 32, fiber: 4 },
    { name: '義大利肉醬麵', description: '義大利麵、牛肉肉醬、帕瑪森起司、羅勒', steps: ['義大利麵煮至 al dente', '製作番茄牛肉肉醬', '麵條拌入肉醬', '撒起司和羅勒'], calories: 680, protein: 32, carbs: 78, fat: 26, fiber: 5 },
    { name: '韓式石鍋拌飯', description: '白飯、各式小菜、韓式辣醬、荷包蛋', steps: ['石鍋底部抹香油，放白飯', '擺上各式小菜', '放上荷包蛋', '淋辣醬拌勻食用'], calories: 620, protein: 24, carbs: 85, fat: 22, fiber: 6 },
    { name: '印度咖哩飯', description: '印度香米、雞肉咖哩、優格、烤餅', steps: ['印度香米蒸熟', '製作雞肉咖哩', '優格調味', '配烤餅一起食用'], calories: 680, protein: 35, carbs: 72, fat: 28, fiber: 4 },
    { name: '泰式打拋豬飯', description: '打拋豬肉、太陽蛋、白飯、過貓', steps: ['蒜頭辣椒爆香', '加入豬肉和打拋醬快炒', '白飯盛碗，放上打拋肉', '配過貓和太陽蛋'], calories: 580, protein: 32, carbs: 55, fat: 24, fiber: 4 },
    { name: '土耳其烤肉串', description: '羊肉串、烤蔬菜、庫斯庫斯、薄荷醬', steps: ['羊肉切塊醃製', '串起後炭烤', '烤蔬菜備用', '配庫斯庫斯和薄荷醬'], calories: 620, protein: 45, carbs: 42, fat: 28, fiber: 5 },
    { name: '美式漢堡', description: '牛肉漢堡排、生菜、番茄、洋蔥、起司', steps: ['漢堡排煎至喜好的熟度', '漢堡麵包稍微烤過', '依序堆疊食材', '搭配薯條食用'], calories: 780, protein: 42, carbs: 55, fat: 42, fiber: 4 },
    { name: '越南春捲', description: '米紙、蝦仁、豬肉、米線、生菜、香草', steps: ['蝦仁和豬肉燙熟', '米紙泡軟包入餡料', '加入米線和生菜', '配花生醬沾食'], calories: 380, protein: 22, carbs: 48, fat: 12, fiber: 4 },
    { name: '日式蕎麥麵', description: '蕎麥麵、蔥花、哇沙米、醬油', steps: ['蕎麥麵煮熟過冰水', '蔥切成蔥花', '準備沾醬和哇沙米', '麵條沾醬食用'], calories: 420, protein: 18, carbs: 72, fat: 8, fiber: 6 },
    { name: '希臘沙拉', description: '費塔起司、橄欖、黃瓜、番茄、洋蔥', steps: ['蔬菜切塊', '放入費塔起司和橄欖', '淋上橄欖油和紅酒醋', '簡單拌勻'], calories: 380, protein: 16, carbs: 18, fat: 28, fiber: 4 },
    { name: '中式炒牛肉麵', description: '牛肉片、芥蘭、洋蔥、麵條、XO醬', steps: ['牛肉片醃製', '洋蔥和芥蘭炒香', '加入牛肉片快炒', '拌入麵條和XO醬'], calories: 580, protein: 38, carbs: 52, fat: 24, fiber: 4 },
    { name: '西班牙海鮮飯', description: '西班牙米、蝦、淡菜、透抽、番紅花', steps: ['製作海鮮高湯', '米和海鮮一起燉煮', '加入番紅花調色', '享用前靜置'], calories: 620, protein: 35, carbs: 72, fat: 18, fiber: 3 },
    { name: '台灣滷肉飯', description: '滷肉、半熟蛋、酸菜、白飯', steps: ['五花肉滷製入味', '半熟蛋水煮', '白飯盛碗，放上滷肉', '配酸菜和滷蛋'], calories: 620, protein: 28, carbs: 65, fat: 28, fiber: 2 },
    { name: '泰式酸辣湯麵', description: '米粉、蝦、青檸汁、香茅、高良薑', steps: ['熬煮酸辣湯底', '加入香茅和高良薑', '放入蝦和米粉', '擠青檸汁調味'], calories: 420, protein: 28, carbs: 52, fat: 14, fiber: 3 },
    { name: '墨西哥酪梨漢堡', description: '牛肉餅、酪梨、培根、墨西哥辣椒', steps: ['牛肉餅煎熟', '酪梨切片', '培根煎脆', '組裝漢堡'], calories: 720, protein: 38, carbs: 42, fat: 45, fiber: 6 },
    { name: '日式烏龍麵', description: '溫泉蛋、肉片、高麗菜、洋蔥、烏龍麵', steps: ['烏龍麵燙熟備用', '製作日式高湯', '擺盤放上肉片和蔬菜', '放上溫泉蛋'], calories: 520, protein: 28, carbs: 65, fat: 16, fiber: 4 },
  ],
  dinner: [
    { name: '香煎牛排配蔬菜', description: '肋眼牛排、烤時蔬、蒜香馬鈴薯、紅酒醬汁', steps: ['牛排室溫回溫，擦乾表面水分', '大火煎牛排每面2分鐘，靜置5分鐘', '馬鈴薯切塊烤至金黃，撒上蒜香', '製作紅酒醬汁，蔬菜烤熟擺盤'], calories: 720, protein: 52, carbs: 35, fat: 42, fiber: 5 },
    { name: '義式海鮮燉飯', description: '義大利米、鮮蝦、淡菜、番紅花、帕瑪森起司', steps: ['洋蔥蒜末炒香，加入義大利米', '分次加入高湯，邊攪拌邊煮', '海鮮（蝦、淡菜）最後5分鐘加入', '撒番紅花和帕瑪森起司調味'], calories: 620, protein: 38, carbs: 72, fat: 22, fiber: 3 },
    { name: '日式咖哩雞肉', description: '雞腿肉、馬鈴薯、紅蘿蔔、椰奶咖哩、茉莉香米', steps: ['雞腿肉切塊煎至金黃', '馬鈴薯、紅蘿蔔切塊備用', '加入咖哩塊和椰奶煮至濃稠', '配茉莉香米一同享用'], calories: 680, protein: 45, carbs: 68, fat: 26, fiber: 4 },
    { name: '泰式綠咖哩', description: '雞胸肉、椰奶、泰式茄子、羅勒、茉莉香米', steps: ['雞胸肉切片', '綠咖哩醬爆香', '加入椰奶和蔬菜', '撒羅勒配飯'], calories: 580, protein: 38, carbs: 55, fat: 26, fiber: 4 },
    { name: '法式紅酒燉牛肉', description: '牛腩、紅酒、胡蘿蔔、蘑菇、珍珠洋蔥', steps: ['牛腩切塊煎上色', '加入紅酒和高湯', '放入蔬菜燉煮2小時', '配法棍或馬鈴泥'], calories: 680, protein: 48, carbs: 32, fat: 35, fiber: 5 },
    { name: '北京烤鴨', description: '烤鴨、蔥段、小黃瓜、甜麵醬、薄餅', steps: ['烤鴨切片', '薄餅稍微蒸熱', '餅皮抹甜麵醬', '加入蔥段和黃瓜包食'], calories: 620, protein: 35, carbs: 55, fat: 32, fiber: 3 },
    { name: '西班牙海鮮燉鍋', description: '海鮮、番茄、白酒、大蒜、番紅花飯', steps: ['海鮮洗淨處理', '番茄和白葡萄酒煮醬汁', '加入海鮮燉煮', '配番紅花飯'], calories: 520, protein: 42, carbs: 38, fat: 18, fiber: 4 },
    { name: '印度奶油雞', description: '雞肉、奶油、番茄泥、印度香料、烤餅', steps: ['雞肉塊醃製', '奶油和香料炒香', '加入番茄泥燉煮', '配印度烤餅'], calories: 620, protein: 42, carbs: 45, fat: 32, fiber: 4 },
    { name: '韓式辣炒年糕', description: '年糕、韓式辣醬、芝麻、蔥花', steps: ['年糕切片', '辣醬加水調開', '年糕翻炒至入味', '撒芝麻和蔥花'], calories: 420, protein: 8, carbs: 78, fat: 12, fiber: 3 },
    { name: '義大利燉肉丸', description: '牛肉丸、番茄醬、起司、義大利麵', steps: ['手打牛肉丸', '番茄醬煮開', '肉丸燉煮入味', '配義大利麵'], calories: 680, protein: 38, carbs: 62, fat: 32, fiber: 4 },
    { name: '日式壽喜燒', description: '和牛片、豆腐、蒟蒻絲、蔬菜、壽喜燒醬', steps: ['壽喜燒醬煮開', '依序涮和牛片', '加入蔬菜和配料', '沾生蛋黃食用'], calories: 580, protein: 45, carbs: 32, fat: 32, fiber: 4 },
    { name: '越南酸湯火鍋', description: '海鮮、番茄、鳳梨、香茅、豆腐', steps: ['酸湯底煮沸', '加入香茅和番茄', '依序加入海鮮', '配米線和蔬菜'], calories: 420, protein: 38, carbs: 35, fat: 14, fiber: 4 },
    { name: '墨西哥辣豆', description: '牛肉、黑豆、辣椒、玉米片、起司', steps: ['牛肉末炒香', '加入黑豆和辣椒', '燉煮入味', '配玉米片和起司'], calories: 580, protein: 35, carbs: 52, fat: 28, fiber: 12 },
    { name: '瑞士起司火鍋', description: '咕咕霍夫麵包、格魯耶爾起司、白酒、蒜頭', steps: ['起司和白酒隔水加熱', '加入蒜香調味', '咕咕霍夫麵包切塊', '沾取起司鍋食用'], calories: 520, protein: 28, carbs: 38, fat: 32, fiber: 2 },
    { name: '廣東白斬雞', description: '土雞、薑蔥醬、白飯、燙青菜', steps: ['土雞白煮至熟', '取出切塊', '準備薑蔥醬', '配白飯和青菜'], calories: 480, protein: 42, carbs: 35, fat: 22, fiber: 2 },
    { name: '義式烤千層茄子', description: '茄子、番茄肉醬、莫札瑞拉起司、羅勒', steps: ['茄子切片烤軟', '一層茄子一層肉醬', '撒起司', '烤至起司融化'], calories: 480, protein: 22, carbs: 35, fat: 28, fiber: 6 },
    { name: '日式生薑燒肉', description: '豬肉片、高麗菜、洋蔥、薑汁醬油、白飯', steps: ['豬肉片醃製', '洋蔥和高麗菜炒軟', '加入豬肉片快炒', '配白飯食用'], calories: 580, protein: 35, carbs: 55, fat: 24, fiber: 4 },
    { name: '泰式羅勒炒飯', description: '米飯、雞肉、泰式羅勒、辣椒、蒜頭', steps: ['雞肉切丁', '蒜頭辣椒爆香', '加入雞肉翻炒', '最後加羅勒快炒'], calories: 520, protein: 28, carbs: 62, fat: 18, fiber: 3 },
  ],
}

const mealDataEn = {
  breakfast: [
    { name: 'Overnight Oats Bowl', description: 'Organic oats, fresh blueberries, banana, chia seeds, almond milk', steps: ['Mix oats and almond milk the night before, refrigerate', 'Add blueberries and sliced banana in the morning', 'Top with chia seeds and stir to combine'], calories: 420, protein: 15, carbs: 65, fat: 12, fiber: 8 },
    { name: 'Eggs Benedict', description: 'English muffin, poached eggs, bacon, hollandaise sauce, side salad', steps: ['Toast English muffin until golden', 'Fry bacon until slightly crispy', 'Make poached eggs with whites set and runny yolks', 'Assemble: muffin + bacon + egg + hollandaise sauce'], calories: 520, protein: 28, carbs: 35, fat: 32, fiber: 2 },
    { name: 'Avocado Toast', description: 'Whole grain toast, smashed avocado, poached egg, cherry tomatoes, sesame', steps: ['Toast whole grain bread until slightly crispy', 'Mash avocado with lemon juice', 'Spread avocado on toast, top with sunny side up egg', 'Garnish with sesame seeds and cherry tomatoes'], calories: 380, protein: 14, carbs: 42, fat: 18, fiber: 7 },
    { name: 'French Toast with Fruits', description: 'Thick bread slices, eggs, milk, honey, fresh fruits', steps: ['Mix eggs and milk for batter', 'Soak bread slices for 5 minutes', 'Pan-fry until golden, drizzle with honey', 'Serve with fresh fruits'], calories: 450, protein: 12, carbs: 58, fat: 16, fiber: 3 },
    { name: 'Japanese Miso Soup', description: 'Miso paste, tofu, wakame, green onions, bonito flakes', steps: ['Bring dashi broth to boil', 'Add miso paste and stir', 'Add tofu cubes and wakame', 'Garnish with green onions and bonito'], calories: 120, protein: 8, carbs: 10, fat: 5, fiber: 2 },
    { name: 'Greek Yogurt Bowl', description: 'Greek yogurt, honey, granola, assorted fruits', steps: ['Pour Greek yogurt into bowl', 'Drizzle with honey', 'Add granola', 'Top with assorted fruits'], calories: 350, protein: 18, carbs: 48, fat: 10, fiber: 5 },
    { name: 'Scallion Pancake with Soy Milk', description: 'Handmade scallion pancakes, thick soy milk, fried egg', steps: ['Pan-fry scallion pancakes until crispy', 'Heat soy milk', 'Add a fried egg if desired', 'Serve with soy milk'], calories: 480, protein: 16, carbs: 55, fat: 22, fiber: 3 },
    { name: 'Smoked Salmon Bagel', description: 'Bagel, smoked salmon, cream cheese, cucumber, dill', steps: ['Warm bagel slightly', 'Spread cream cheese', 'Layer smoked salmon slices', 'Top with cucumber and dill'], calories: 420, protein: 25, carbs: 42, fat: 18, fiber: 3 },
    { name: 'Thai Tea Toast', description: 'Thick toast, Thai tea custard, coconut flakes', steps: ['Make Thai tea custard', 'Toast bread until golden', 'Spread custard on toast', 'Top with coconut flakes'], calories: 480, protein: 8, carbs: 62, fat: 22, fiber: 2 },
    { name: 'Japanese Tamagoyaki', description: 'Eggs, dashi, soy sauce, mirin, nori', steps: ['Beat eggs with dashi and seasonings', 'Heat tamagoyaki pan', 'Pour egg mixture and roll', 'Cut into pieces to serve with rice'], calories: 220, protein: 14, carbs: 8, fat: 14, fiber: 0 },
    { name: 'Vietnamese Bánh Mì', description: 'Vietnamese baguette, grilled pork, mayo, pickled vegetables', steps: ['Cut baguette in half', 'Fill with grilled pork and vegetables', 'Spread mayo', 'Cut into halves'], calories: 450, protein: 22, carbs: 48, fat: 20, fiber: 4 },
    { name: 'Korean Pancake', description: 'Batter, green onions, seafood, chives, dipping sauce', steps: ['Mix batter ingredients', 'Fry on pan until golden', 'Serve with dipping sauce', 'Best eaten hot'], calories: 380, protein: 18, carbs: 42, fat: 16, fiber: 3 },
    { name: 'Australian Big Breakfast', description: 'Bacon, fried eggs, roasted tomatoes, mushrooms, baked beans', steps: ['Fry bacon until crispy', 'Fry sunny side up eggs', 'Roast tomatoes and mushrooms', 'Plate with baked beans'], calories: 650, protein: 35, carbs: 38, fat: 42, fiber: 6 },
    { name: 'Taiwanese Egg Crepe', description: 'Frozen pastry wrapper, eggs, green onions, soy sauce', steps: ['Pan-fry wrapper until golden', 'Crack egg and sprinkle green onions', 'Drizzle with soy sauce', 'Roll up and cut'], calories: 380, protein: 14, carbs: 42, fat: 18, fiber: 2 },
    { name: 'Indian Masala Chai', description: 'Black tea, milk, spices (cardamom, ginger, clove), sugar', steps: ['Boil water with spices', 'Add tea leaves and brew', 'Pour in milk and simmer', 'Strain and sweeten'], calories: 180, protein: 6, carbs: 22, fat: 8, fiber: 0 },
    { name: 'Chinese Congee', description: 'White rice porridge, century egg, shredded pork, green onions', steps: ['Simmer rice until thick', 'Add century egg and pork', 'Garnish with green onions', 'Serve with salted egg'], calories: 320, protein: 18, carbs: 48, fat: 6, fiber: 2 },
    { name: 'Spanish Tortilla', description: 'Eggs, potatoes, onion, bell peppers, ham', steps: ['Fry diced potatoes and onion', 'Add bell peppers and ham', 'Pour beaten eggs', 'Fry until set, flip'], calories: 420, protein: 22, carbs: 32, fat: 26, fiber: 3 },
    { name: 'Vietnamese Coffee Toast', description: 'Baguette, condensed milk, Vietnamese coffee, butter', steps: ['Slice and butter baguette, toast until crispy', 'Brew Vietnamese coffee with condensed milk', 'Let coffee cool', 'Enjoy with toast'], calories: 380, protein: 8, carbs: 52, fat: 16, fiber: 2 },
  ],
  lunch: [
    { name: 'Salmon Salad Bowl', description: 'Grilled salmon, mixed greens, quinoa, avocado, Japanese sesame dressing', steps: ['Cook quinoa according to package', 'Season salmon and grill for 15 minutes', 'Arrange greens on bowl, add quinoa', 'Top with sliced grilled salmon and avocado, drizzle dressing'], calories: 580, protein: 42, carbs: 38, fat: 28, fiber: 6 },
    { name: 'Vietnamese Pho', description: 'Rice noodles, beef slices, bean sprouts, cilantro, mint, Thai basil', steps: ['Simmer beef bone broth for 2 hours', 'Cook rice noodles and place in bowl', 'Arrange thin beef slices and bean sprouts', 'Add hot broth, garnish with herbs'], calories: 480, protein: 32, carbs: 55, fat: 14, fiber: 3 },
    { name: 'Chicken Tacos', description: 'Corn tortillas, shredded chicken, guacamole, tomato salsa, sour cream', steps: ['Season and stir-fry shredded chicken', 'Make salsa: dice tomatoes, onion, cilantro', 'Warm corn tortillas', 'Assemble: tortilla + chicken + salsa + guacamole + sour cream'], calories: 520, protein: 35, carbs: 45, fat: 22, fiber: 6 },
    { name: 'Japanese Tonkatsu Rice', description: 'Fried pork cutlet, shredded cabbage, white rice, miso soup', steps: ['Bread and fry pork cutlet until golden', 'Cut into strips', 'Serve over rice', 'Pair with cabbage and miso soup'], calories: 720, protein: 38, carbs: 65, fat: 32, fiber: 4 },
    { name: 'Spaghetti Bolognese', description: 'Spaghetti pasta, beef bolognese sauce, parmesan cheese, basil', steps: ['Cook pasta until al dente', 'Make tomato beef bolognese', 'Toss pasta with sauce', 'Top with cheese and basil'], calories: 680, protein: 32, carbs: 78, fat: 26, fiber: 5 },
    { name: 'Korean Bibimbap', description: 'White rice, assorted side dishes, gochujang, fried egg', steps: ['Oil a stone pot, add rice', 'Arrange assorted side dishes', 'Top with fried egg', 'Mix with gochujang'], calories: 620, protein: 24, carbs: 85, fat: 22, fiber: 6 },
    { name: 'Indian Chicken Curry Rice', description: 'Basmati rice, chicken curry, yogurt, naan bread', steps: ['Steam basmati rice', 'Make chicken curry', 'Season yogurt', 'Serve with naan bread'], calories: 680, protein: 35, carbs: 72, fat: 28, fiber: 4 },
    { name: 'Thai Pad Krapow Rice', description: 'Stir-fried basil pork, fried egg, white rice, water spinach', steps: ['Sauté garlic and chilies', 'Add pork and basil sauce, stir-fry', 'Serve over rice', 'Pair with water spinach and fried egg'], calories: 580, protein: 32, carbs: 55, fat: 24, fiber: 4 },
    { name: 'Turkish Kebab Platter', description: 'Lamb skewers, grilled vegetables, couscous, mint sauce', steps: ['Marinate and cube lamb', 'Grill on skewers', 'Grill vegetables', 'Serve with couscous and mint sauce'], calories: 620, protein: 45, carbs: 42, fat: 28, fiber: 5 },
    { name: 'American Burger', description: 'Beef patty, lettuce, tomato, onion, cheese', steps: ['Grill patty to desired doneness', 'Toast bun', 'Layer all ingredients', 'Serve with fries'], calories: 780, protein: 42, carbs: 55, fat: 42, fiber: 4 },
    { name: 'Vietnamese Spring Rolls', description: 'Rice paper, shrimp, pork, vermicelli, lettuce, herbs', steps: ['Cook shrimp and pork', 'Wrap filling in soaked rice paper', 'Add vermicelli and lettuce', 'Dip in peanut sauce'], calories: 380, protein: 22, carbs: 48, fat: 12, fiber: 4 },
    { name: 'Japanese Soba Noodles', description: 'Buckwheat noodles, green onions, wasabi, soy sauce', steps: ['Cook soba, rinse in cold water', 'Chop green onions', 'Prepare dipping sauce with wasabi', 'Dip noodles to eat'], calories: 420, protein: 18, carbs: 72, fat: 8, fiber: 6 },
    { name: 'Greek Salad', description: 'Feta cheese, olives, cucumber, tomatoes, red onion', steps: ['Cube vegetables', 'Add feta and olives', 'Drizzle olive oil and red wine vinegar', 'Toss gently'], calories: 380, protein: 16, carbs: 18, fat: 28, fiber: 4 },
    { name: 'Chinese Beef Noodles', description: 'Beef slices, kale, onion, noodles, XO sauce', steps: ['Marinate beef', 'Stir-fry onion and kale', 'Add beef slices quickly', 'Mix with noodles and XO sauce'], calories: 580, protein: 38, carbs: 52, fat: 24, fiber: 4 },
    { name: 'Spanish Paella', description: 'Spanish rice, shrimp, mussels, squid, saffron', steps: ['Prepare seafood stock', 'Cook rice with seafood', 'Add saffron for color', 'Rest before serving'], calories: 620, protein: 35, carbs: 72, fat: 18, fiber: 3 },
    { name: 'Taiwanese Braised Pork Rice', description: 'Braised pork, soft-boiled egg, pickled vegetables, rice', steps: ['Braise pork belly until tender', 'Soft-boil eggs', 'Serve braised pork over rice', 'Pair with pickled vegetables'], calories: 620, protein: 28, carbs: 65, fat: 28, fiber: 2 },
    { name: 'Thai Tom Yum Noodles', description: 'Rice noodles, shrimp, lime, lemongrass, galangal', steps: ['Prepare Tom Yum broth', 'Add lemongrass and galangal', 'Add shrimp and noodles', 'Squeeze lime to season'], calories: 420, protein: 28, carbs: 52, fat: 14, fiber: 3 },
    { name: 'Mexican Guacamole Burger', description: 'Beef patty, guacamole, bacon, jalapeños', steps: ['Grill beef patty', 'Slice avocado', 'Fry bacon until crispy', 'Assemble burger'], calories: 720, protein: 38, carbs: 42, fat: 45, fiber: 6 },
    { name: 'Japanese Udon Noodles', description: 'Onsen egg, pork slices, cabbage, onion, udon noodles', steps: ['Boil udon noodles', 'Prepare Japanese broth', 'Arrange pork and vegetables', 'Top with onsen egg'], calories: 520, protein: 28, carbs: 65, fat: 16, fiber: 4 },
  ],
  dinner: [
    { name: 'Grilled Steak with Vegetables', description: 'Ribeye steak, roasted seasonal vegetables, garlic mashed potatoes, red wine sauce', steps: ['Bring steak to room temperature', 'Sear steak 2 minutes per side, rest 5 minutes', 'Roast cubed potatoes with garlic until golden', 'Make red wine sauce, roast vegetables and plate'], calories: 720, protein: 52, carbs: 35, fat: 42, fiber: 5 },
    { name: 'Italian Seafood Risotto', description: 'Arborio rice, fresh shrimp, mussels, saffron, parmesan cheese', steps: ['Sauté onion and garlic, add arborio rice', 'Add broth gradually, stirring constantly', 'Add seafood in last 5 minutes', 'Finish with saffron and parmesan'], calories: 620, protein: 38, carbs: 72, fat: 22, fiber: 3 },
    { name: 'Japanese Chicken Curry', description: 'Chicken thigh, potatoes, carrots, coconut curry, jasmine rice', steps: ['Cut chicken thighs and sear until golden', 'Cube potatoes and carrots', 'Add curry roux and coconut milk, simmer', 'Serve over jasmine rice'], calories: 680, protein: 45, carbs: 68, fat: 26, fiber: 4 },
    { name: 'Thai Green Curry', description: 'Chicken breast, coconut milk, Thai eggplant, basil, jasmine rice', steps: ['Slice chicken breast', 'Sauté green curry paste', 'Add coconut milk and vegetables', 'Top with basil, serve with rice'], calories: 580, protein: 38, carbs: 55, fat: 26, fiber: 4 },
    { name: 'French Beef Bourguignon', description: 'Beef chuck, red wine, carrots, mushrooms, pearl onions', steps: ['Brown beef chunks', 'Add red wine and broth', 'Add vegetables, simmer 2 hours', 'Serve with bread or mashed potatoes'], calories: 680, protein: 48, carbs: 32, fat: 35, fiber: 5 },
    { name: 'Peking Duck', description: 'Roasted duck, scallions, cucumber, hoisin sauce, pancakes', steps: ['Slice roasted duck', 'Steam pancakes briefly', 'Spread hoisin on pancake', 'Add scallions and cucumber, wrap and eat'], calories: 620, protein: 35, carbs: 55, fat: 32, fiber: 3 },
    { name: 'Spanish Seafood Stew', description: 'Seafood, tomatoes, white wine, garlic, saffron rice', steps: ['Clean and prepare seafood', 'Cook tomatoes with white wine', 'Add seafood and simmer', 'Serve with saffron rice'], calories: 520, protein: 42, carbs: 38, fat: 18, fiber: 4 },
    { name: 'Indian Butter Chicken', description: 'Chicken, butter, tomato puree, Indian spices, naan', steps: ['Marinate chicken pieces', 'Sauté with butter and spices', 'Add tomato puree and simmer', 'Serve with naan bread'], calories: 620, protein: 42, carbs: 45, fat: 32, fiber: 4 },
    { name: 'Korean Tteokbokki', description: 'Rice cakes, Korean chili paste, sesame, green onions', steps: ['Slice rice cakes', 'Mix chili paste with water', 'Stir-fry rice cakes until glazed', 'Top with sesame and green onions'], calories: 420, protein: 8, carbs: 78, fat: 12, fiber: 3 },
    { name: 'Italian Meatballs', description: 'Beef meatballs, tomato sauce, cheese, spaghetti', steps: ['Form handmade meatballs', 'Simmer tomato sauce', 'Cook meatballs in sauce', 'Serve with spaghetti'], calories: 680, protein: 38, carbs: 62, fat: 32, fiber: 4 },
    { name: 'Japanese Sukiyaki', description: 'Wagyu slices, tofu, shirataki, vegetables, sukiyaki sauce', steps: ['Bring sukiyaki sauce to boil', 'Dip wagyu slices briefly', 'Add vegetables and ingredients', 'Dip in raw egg yolk to eat'], calories: 580, protein: 45, carbs: 32, fat: 32, fiber: 4 },
    { name: 'Vietnamese Sour Soup Hotpot', description: 'Seafood, tomatoes, pineapple, lemongrass, tofu', steps: ['Bring sour broth to boil', 'Add lemongrass and tomatoes', 'Add seafood gradually', 'Serve with rice noodles and vegetables'], calories: 420, protein: 38, carbs: 35, fat: 14, fiber: 4 },
    { name: 'Mexican Chili con Carne', description: 'Ground beef, black beans, chilies, tortilla chips, cheese', steps: ['Brown ground beef', 'Add black beans and chilies', 'Simmer until flavored', 'Serve with chips and cheese'], calories: 580, protein: 35, carbs: 52, fat: 28, fiber: 12 },
    { name: 'Swiss Cheese Fondue', description: 'Gruyère cheese, white wine, garlic, cubed bread', steps: ['Melt cheese with wine over double boiler', 'Add garlic seasoning', 'Cut bread into cubes', 'Dip bread into fondue'], calories: 520, protein: 28, carbs: 38, fat: 32, fiber: 2 },
    { name: 'Cantonese White Cut Chicken', description: 'Free-range chicken, ginger-scallion sauce, rice, boiled greens', steps: ['Boil chicken until cooked', 'Remove and cut into pieces', 'Prepare ginger-scallion sauce', 'Serve with rice and greens'], calories: 480, protein: 42, carbs: 35, fat: 22, fiber: 2 },
    { name: 'Italian Eggplant Parmesan', description: 'Eggplant, meat sauce, mozzarella cheese, basil', steps: ['Slice and roast eggplant', 'Layer with meat sauce', 'Top with cheese', 'Bake until cheese melts'], calories: 480, protein: 22, carbs: 35, fat: 28, fiber: 6 },
    { name: 'Japanese Shogayaki', description: 'Pork slices, cabbage, onion, ginger soy sauce, rice', steps: ['Marinate pork slices', 'Sauté onion and cabbage', 'Quick-fry pork', 'Serve over rice'], calories: 580, protein: 35, carbs: 55, fat: 24, fiber: 4 },
    { name: 'Thai Basil Fried Rice', description: 'Rice, chicken, Thai basil, chilies, garlic', steps: ['Dice chicken', 'Sauté garlic and chilies', 'Add chicken and stir-fry', 'Finish with Thai basil'], calories: 520, protein: 28, carbs: 62, fat: 18, fiber: 3 },
  ],
}

const mealDataId = {
  breakfast: [
    { name: 'Mangkok Oat Buah', description: 'Oat organik, blueberry segar, pisang, chia seed, susu almond', steps: ['Campurkan oat dan susu almond malam sebelumnya', 'Tambahkan blueberry dan pisang iris di pagi hari', 'Taburkan chia seed dan aduk rata'], calories: 420, protein: 15, carbs: 65, fat: 12, fiber: 8 },
    { name: 'Telur Benediktus', description: 'Muffin Inggris, telur rebus, bacon, saus hollandaise, salad', steps: ['Panggang muffin Inggris hingga keemasan', 'Goreng bacon hingga sedikit garing', 'Buat telur rebus dengan putih matang kuning encer', 'Rakit: muffin + bacon + telur + saus hollandaise'], calories: 520, protein: 28, carbs: 35, fat: 32, fiber: 2 },
    { name: 'Roti Alpukat', description: 'Roti gandum utuh, alpukat lumat, telur mata sapi, tomat ceri, wijen', steps: ['Panggang roti gandum hingga renyah', 'Lumat alpukat dengan perasan jeruk nipis', 'Oleskan alpukat di roti, taruh telur mata sapi', 'Taburi wijen dan tomat ceri'], calories: 380, protein: 14, carbs: 42, fat: 18, fiber: 7 },
    { name: 'Roti Puding Perancis', description: 'Irisan roti tebal, telur, susu, madu, buah segar', steps: ['Campurkan telur dan susu', 'Rendam irisan roti 5 menit', 'Goreng hingga keemasan, siram madu', 'Sajikan dengan buah segar'], calories: 450, protein: 12, carbs: 58, fat: 16, fiber: 3 },
    { name: 'Sup Miso Jepang', description: 'Pasta miso, tahu, rumput laut, daun bawang,abon ikan', steps: ['Didihkan kaldu dashi', 'Masukkan pasta miso, aduk', 'Tambahkan tahu dan rumput laut', 'Hias dengan daun bawang dan abon ikan'], calories: 120, protein: 8, carbs: 10, fat: 5, fiber: 2 },
    { name: 'Mangkok Yogurt', description: 'Yogurt Yunani, madu, granola, berbagai buah', steps: ['Tuangkan yogurt ke mangkok', 'Siram madu', 'Tambahkan granola', 'Tata buah-buahan di atas'], calories: 350, protein: 18, carbs: 48, fat: 10, fiber: 5 },
    { name: 'Kue Terbang Bawang Daun', description: 'Kue bawang, susu kedelai, telur goreng', steps: ['Goreng kue bawang hingga renyah', 'Panaskan susu kedelai', 'Tambahkan telur goreng jika suka', 'Sajikan dengan susu kedelai'], calories: 480, protein: 16, carbs: 55, fat: 22, fiber: 3 },
    { name: 'Bagel Salmon Asap', description: 'Bagel, salmon asap, cream cheese, timun, adas', steps: ['Hangatkan bagel sedikit', 'Oleskan cream cheese', 'Tambahkan irisan salmon asap', 'Hias dengan timun dan adas'], calories: 420, protein: 25, carbs: 42, fat: 18, fiber: 3 },
    { name: 'Roti Thai Tea', description: 'Roti tebal, vla Thai tea, serpihan kelapa', steps: ['Buat vla Thai tea', 'Panggang roti hingga keemasan', 'Oleskan vla', 'Taburi serpihan kelapa'], calories: 480, protein: 8, carbs: 62, fat: 22, fiber: 2 },
    { name: 'Tamagoyaki Jepang', description: 'Telur, dashi, kecap asin, mirin, nori', steps: ['Kocok telur dengan dashi dan bumbu', 'Panaskan wajan tamagoyaki', 'Tuangkan adonan telur, gulung', 'Potong dan sajikan dengan nasi'], calories: 220, protein: 14, carbs: 8, fat: 14, fiber: 0 },
    { name: 'Bánh Mì Vietnam', description: 'Roti baguette Vietnam, daging babi panggang, mayones, sayuran', steps: ['Belah baguette', 'Isi dengan daging panggang dan sayuran', 'Oleskan mayones', 'Potong dua bagian'], calories: 450, protein: 22, carbs: 48, fat: 20, fiber: 4 },
    { name: 'Kue Korea', description: 'Adonan, daun bawang, seafood, kucai, saus celup', steps: ['Campurkan bahan adonan', 'Goreng di wajan hingga keemasan', 'Sajikan dengan saus celup', 'Paling enak dimakan panas'], calories: 380, protein: 18, carbs: 42, fat: 16, fiber: 3 },
    { name: 'Sarapan Besar Australia', description: 'Bacon, telur goreng, tomat panggang, jamur, baked beans', steps: ['Goreng bacon hingga garing', 'Goreng telur mata sapi', 'Panggang tomat dan jamur', 'Tata dengan baked beans'], calories: 650, protein: 35, carbs: 38, fat: 42, fiber: 6 },
    { name: 'Kulit Lumpia Taiwan', description: 'Kulit lumpia, telur, daun bawang, kecap asin', steps: ['Goreng kulit lumpia hingga keemasan', 'Pecahkan telur, taburi daun bawang', 'Siram kecap asin', 'Gulung dan potong'], calories: 380, protein: 14, carbs: 42, fat: 18, fiber: 2 },
    { name: 'Teh Masala India', description: 'Teh hitam, susu, rempah (kapulaga, jahe, cengkeh), gula', steps: ['Didihkan air dengan rempah', 'Masukkan daun teh, seduh', 'Tuang susu, didihkan', 'Saring dan tambah gula'], calories: 180, protein: 6, carbs: 22, fat: 8, fiber: 0 },
    { name: 'Bubur Cina', description: 'Bubur nasi, telur century, daging babi cincang, daun bawang', steps: ['Masak nasi hingga lembut', 'Masukkan telur century dan daging', 'Taburi daun bawang', 'Sajikan dengan telur asin'], calories: 320, protein: 18, carbs: 48, fat: 6, fiber: 2 },
    { name: 'Tortilla Spanyol', description: 'Telur, kentang, bawang bombay, paprika, ham', steps: ['Goreng kentang dan bawang bombay', 'Tambahkan paprika dan ham', 'Tuangkan telur kocok', 'Masak hingga mengeras, balik'], calories: 420, protein: 22, carbs: 32, fat: 26, fiber: 3 },
    { name: 'Kopi Vietnam Roti', description: 'Baguette, susu kental manis, kopi Vietnam, mentega', steps: ['Potong dan olesi baguette dengan mentega, panggang', 'Brew kopi Vietnam dengan susu kental', 'Dinginkan kopi', 'Nikmati dengan roti'], calories: 380, protein: 8, carbs: 52, fat: 16, fiber: 2 },
  ],
  lunch: [
    { name: 'Mangkok Salad Salmon', description: 'Salmon panggang, sayuran hijau, quinoa, alpukat, saus wijen Jepang', steps: ['Masak quinoa sesuai petunjuk', 'Bumbui salmon dan panggang 15 menit', 'Susun sayuran di mangkok, tambahkan quinoa', 'Tambahkan salmon panggang dan alpukat, siram saus'], calories: 580, protein: 42, carbs: 38, fat: 28, fiber: 6 },
    { name: 'Mi Pho Vietnam', description: 'Bihun rice, irisan daging sapi, tauge, ketumbar, mint, basil Thailand', steps: ['Rebus kaldu tulang sapi selama 2 jam', 'Masak bihun dan taruh di mangkok', 'Susun irisan daging sapi dan tauge', 'Siram kuah panas, hiasi dengan rempah'], calories: 480, protein: 32, carbs: 55, fat: 14, fiber: 3 },
    { name: 'Taco Ayam', description: 'Tortilla jagung, ayam suwir, alpukat, salsa tomat, krim asam', steps: ['Bumbui dan tumis ayam suwir', 'Buat salsa: potong tomat, bawang merah, ketumbar', 'Panaskan tortilla jagung', 'Rakit: tortilla + ayam + salsa + alpukat + krim asam'], calories: 520, protein: 35, carbs: 45, fat: 22, fiber: 6 },
    { name: 'Nasi Tonkatsu Jepang', description: 'Katsu babi goreng, kol parut, nasi putih, sup miso', steps: ['Balut dan goreng katsu hingga keemasan', 'Potong-potong', 'Sajikan di atas nasi', 'Lengkapi dengan kol dan sup miso'], calories: 720, protein: 38, carbs: 65, fat: 32, fiber: 4 },
    { name: 'Spaghetti Bolognese', description: 'Pasta spageti, saus bolognese daging sapi, keju parmesan, basil', steps: ['Masak pasta hingga al dente', 'Buat saus bolognese tomat daging sapi', 'Aduk pasta dengan saus', 'Taburi keju dan basil'], calories: 680, protein: 32, carbs: 78, fat: 26, fiber: 5 },
    { name: 'Bibimbap Korea', description: 'Nasi putih, lauk pauk, gochujang, telur goreng', steps: ['Olesi batu dengan minyak, tambahkan nasi', 'Susun lauk-pauk di atas', 'Tambahkan telur goreng', 'Aduk dengan gochujang'], calories: 620, protein: 24, carbs: 85, fat: 22, fiber: 6 },
    { name: 'Nasi Kari India', description: 'Nasi basmati, kari ayam, yogurt, roti naan', steps: ['Kukus nasi basmati', 'Buat kari ayam', 'Bumbui yogurt', 'Sajikan dengan roti naan'], calories: 680, protein: 35, carbs: 72, fat: 28, fiber: 4 },
    { name: 'Nasi Pad Krapow Thai', description: 'Babi tumis kemangi, telur mata sapi, nasi putih, kangkung', steps: ['Tumis bawang putih dan cabai', 'Masukkan daging babi dan saus krapow, aduk cepat', 'Sajikan di atas nasi', 'Lengkapi dengan kangkung dan telur mata sapi'], calories: 580, protein: 32, carbs: 55, fat: 24, fiber: 4 },
    { name: 'Sate Kebab Turki', description: 'Sate domba, sayuran panggang, couscous, saus mint', steps: ['Marinasi dan potong dadu domba', 'Panggang di tusuk sate', 'Panggang sayuran', 'Sajikan dengan couscous dan saus mint'], calories: 620, protein: 45, carbs: 42, fat: 28, fiber: 5 },
    { name: 'Burger Amerika', description: 'Patty daging sapi, selada, tomat, bawang, keju', steps: ['Panggang patty sesuai tingkat kematangan', 'Panggang roti', 'Susun semua bahan', 'Sajikan dengan kentang goreng'], calories: 780, protein: 42, carbs: 55, fat: 42, fiber: 4 },
    { name: 'Gyoza Vietnam', description: 'Kertas nasi, udang, daging babi, bihun, selada, rempah', steps: ['Masak udang dan daging babi', 'Bungkus isian dengan kertas nasi', 'Tambahkan bihun dan selada', 'Celupkan ke saus kacang'], calories: 380, protein: 22, carbs: 48, fat: 12, fiber: 4 },
    { name: 'Soba Jepang', description: 'Mie soba, daun bawang, wasabi, kecap asin', steps: ['Masak soba, bilas air dingin', 'Potong daun bawang', 'Siapkan saus celup dengan wasabi', 'Celupkan mie untuk dimakan'], calories: 420, protein: 18, carbs: 72, fat: 8, fiber: 6 },
    { name: 'Salad Yunani', description: 'Keju feta, zaitun, mentimun, tomat, bawang merah', steps: ['Potong dadu sayuran', 'Masukkan feta dan zaitun', 'Siram minyak zaitun dan cuka merah', 'Aduk perlahan'], calories: 380, protein: 16, carbs: 18, fat: 28, fiber: 4 },
    { name: 'Mie Goreng Sapi', description: 'Irisan daging sapi, kailan, bawang bombay, mie, saus XO', steps: ['Marinasi daging sapi', 'Tumis bawang bombay dan kailan', 'Masukkan irisan daging sapi', 'Aduk dengan mie dan saus XO'], calories: 580, protein: 38, carbs: 52, fat: 24, fiber: 4 },
    { name: 'Paella Spanyol', description: 'Nasi Spanyol, udang, kerang, cumi, kunyit', steps: ['Siapkan kaldu seafood', 'Masak nasi dengan seafood', 'Tambahkan kunyit untuk warna', 'Diamkan sebelum disajikan'], calories: 620, protein: 35, carbs: 72, fat: 18, fiber: 3 },
    { name: 'Nasi Babi卤 Taiwan', description: 'Babi卤, telur setengah matang, sayuran asin, nasi', steps: ['B卤 daging babi sampai empuk', 'Rebus telur setengah matang', 'Sajikan babi卤 di atas nasi', 'Lengkapi dengan sayuran asin'], calories: 620, protein: 28, carbs: 65, fat: 28, fiber: 2 },
    { name: 'Mie Tom Yum Thai', description: 'Bihun, udang, perasan limau, serai, lengkuas', steps: ['Siapkan kuah Tom Yum', 'Masukkan serai dan lengkuas', 'Masukkan udang dan bihun', 'Peras limau untuk bumbu'], calories: 420, protein: 28, carbs: 52, fat: 14, fiber: 3 },
    { name: 'Burger Guacamole Meksiko', description: 'Patty daging sapi, guacamole, bacon, cabai jalapeño', steps: ['Panggang patty daging sapi', 'Potong alpukat', 'Goreng bacon hingga garing', 'Rakit burger'], calories: 720, protein: 38, carbs: 42, fat: 45, fiber: 6 },
    { name: 'Udon Jepang', description: 'Telur onsen, irisan daging babi, kol, bawang bombay, mie udon', steps: ['Masak mie udon', 'Buat kaldu Jepang', 'Susun daging babi dan sayuran', 'Taruh telur onsen di atas'], calories: 520, protein: 28, carbs: 65, fat: 16, fiber: 4 },
  ],
  dinner: [
    { name: 'Steik Panggang dengan Sayuran', description: 'Steik ribeye, sayuran panggang, kentang bawang putih, saus anggur merah', steps: ['Keluarkan steik dari kulkas 30 menit sebelumnya', 'Panggang steik 2 menit setiap sisi, diamkan 5 menit', 'Panggang kentang dengan bawang putih', 'Buat saus anggur merah, panggang sayuran dan sajikan'], calories: 720, protein: 52, carbs: 35, fat: 42, fiber: 5 },
    { name: 'Risotto Seafood Italia', description: 'Beras arborio, udang segar, kerang, saffron, keju parmesan', steps: ['Tumis bawang bombay dan bawang putih, masukkan beras arborio', 'Tambahkan kaldu sedikit demi sedikit sambil diaduk', 'Masukkan seafood 5 menit terakhir', 'Selesai dengan saffron dan keju parmesan'], calories: 620, protein: 38, carbs: 72, fat: 22, fiber: 3 },
    { name: 'Kari Ayam Jepang', description: 'Paha ayam, kentang, wortel, kari santan, nasi jasmine', steps: ['Potong paha ayam dan goreng hingga kecokelatan', 'Potong kentang dan wortel', 'Tambahkan kari dan santan, masak hingga mengental', 'Sajikan dengan nasi jasmine'], calories: 680, protein: 45, carbs: 68, fat: 26, fiber: 4 },
    { name: 'Kari Hijau Thai', description: 'Dada ayam, santan, terong Thai, kemangi, nasi jasmine', steps: ['Potong dadu dada ayam', 'Tumis pasta kari hijau', 'Masukkan santan dan sayuran', 'Taburi kemangi, sajikan dengan nasi'], calories: 580, protein: 38, carbs: 55, fat: 26, fiber: 4 },
    { name: 'Beef Bourguignon Perancis', description: 'Daging babi, anggur merah, wortel, jamur, bawang merah kecil', steps: ['Goreng daging hingga kecokelatan', 'Masukkan anggur merah dan kaldu', 'Masukkan sayuran, didihkan 2 jam', 'Sajikan dengan roti atau kentang tumbuk'], calories: 680, protein: 48, carbs: 32, fat: 35, fiber: 5 },
    { name: 'Bebek Panggang Peking', description: 'Bebek panggang, daun bawang, timun, saus hoisin, pancake', steps: ['Iris bebek panggang', 'Kukus pancake sebentar', 'Oleskan saus hoisin', 'Tambahkan daun bawang dan timun, bungkus dan makan'], calories: 620, protein: 35, carbs: 55, fat: 32, fiber: 3 },
    { name: 'Sup Seafood Spanyol', description: 'Seafood, tomat, anggur putih, bawang putih, nasi saffron', steps: ['Bersihkan dan siapkan seafood', 'Masak tomat dengan anggur putih', 'Masukkan seafood dan didihkan', 'Sajikan dengan nasi saffron'], calories: 520, protein: 42, carbs: 38, fat: 18, fiber: 4 },
    { name: 'Butter Chicken India', description: 'Ayam, mentega, puree tomat, rempah India, roti naan', steps: ['Marinasi potongan ayam', 'Tumis dengan mentega dan rempah', 'Masukkan puree tomat dan didihkan', 'Sajikan dengan roti naan'], calories: 620, protein: 42, carbs: 45, fat: 32, fiber: 4 },
    { name: 'Tteokbokki Korea', description: 'Kue beras, pasta cabai Korea, wijen, daun bawang', steps: ['Potong kue beras', 'Campurkan pasta cabai dengan air', 'Aduk kue beras hingga tercampur', 'Taburi wijen dan daun bawang'], calories: 420, protein: 8, carbs: 78, fat: 12, fiber: 3 },
    { name: 'Bola Daging Italia', description: 'Bola daging sapi, saus tomat, keju, spageti', steps: ['Bentuk bola daging manual', 'Didihkan saus tomat', 'Masak bola daging dalam saus', 'Sajikan dengan spageti'], calories: 680, protein: 38, carbs: 62, fat: 32, fiber: 4 },
    { name: 'Sukiyaki Jepang', description: 'Irisan wagyu, tahu, shirataki, sayuran, saus sukiyaki', steps: ['Didihkan saus sukiyaki', 'Celupkan irisan wagyu sebentar', 'Masukkan sayuran dan bahan', 'Celupkan ke kuning telur mentah untuk dimakan'], calories: 580, protein: 45, carbs: 32, fat: 32, fiber: 4 },
    { name: 'Hotpot Sup Asam Vietnam', description: 'Seafood, tomat, nanas, serai, tahu', steps: ['Didihkan kuah asam', 'Masukkan serai dan tomat', 'Masukkan seafood sedikit demi sedikit', 'Sajikan dengan bihun dan sayuran'], calories: 420, protein: 38, carbs: 35, fat: 14, fiber: 4 },
    { name: 'Chili con Carne Meksiko', description: 'Daging sapi giling, kacang hitam, cabai, tortilla chips, keju', steps: ['Goreng daging sapi giling', 'Masukkan kacang hitam dan cabai', 'Didihkan hingga beraroma', 'Sajikan dengan tortilla dan keju'], calories: 580, protein: 35, carbs: 52, fat: 28, fiber: 12 },
    { name: 'Fondue Keju Swiss', description: 'Keju Gruyère, anggur putih, bawang putih, roti kubus', steps: ['Lelehkan keju dengan anggur', 'Tambahkan bumbu bawang putih', 'Potong roti menjadi kubus', 'Celupkan roti ke fondue'], calories: 520, protein: 28, carbs: 38, fat: 32, fiber: 2 },
    { name: 'Ayam Putih Guangdong', description: 'Ayam petelur, saus jahe bawang, nasi, sayuran rebus', steps: ['Rebus ayam hingga matang', 'Keluarkan dan potong-potong', 'Buat saus jahe bawang', 'Sajikan dengan nasi dan sayuran'], calories: 480, protein: 42, carbs: 35, fat: 22, fiber: 2 },
    { name: 'Terong Parmesan Italia', description: 'Terong, saus daging, keju mozzarella, kemangi', steps: ['Potong dan panggang terong', 'Lapisan terong dengan saus daging', 'Taburi keju', 'Panggang hingga keju meleleh'], calories: 480, protein: 22, carbs: 35, fat: 28, fiber: 6 },
    { name: 'Shogayaki Jepang', description: 'Irisan daging babi, kol, bawang bombay, kecap jahe, nasi', steps: ['Marinasi irisan daging babi', 'Tumis bawang bombay dan kol', 'Masak daging babi cepat', 'Sajikan di atas nasi'], calories: 580, protein: 35, carbs: 55, fat: 24, fiber: 4 },
    { name: 'Nasi Goreng Kemangi Thai', description: 'Nasi, ayam, kemangi Thai, cabai, bawang putih', steps: ['Potong dadu ayam', 'Tumis bawang putih dan cabai', 'Masukkan ayam dan aduk', 'Selesai dengan kemangi Thai'], calories: 520, protein: 28, carbs: 62, fat: 18, fiber: 3 },
  ],
}

const getMealData = (lang) => {
  switch(lang) {
    case 'en': return mealDataEn
    case 'id': return mealDataId
    default: return mealData
  }
}

function LanguageSelector() {
  const { language, setLanguage, t } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)

  const languages = [
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'id', label: 'Bahasa Indonesia', flag: '🇮🇩' },
    { code: 'zh', label: '繁體中文', flag: '🇹🇼' },
  ]

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl transition-all backdrop-blur-sm"
      >
        <Globe className="w-5 h-5" />
        <span className="hidden sm:inline">{t('language')}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 bg-white rounded-xl shadow-lg py-2 z-50 min-w-[220px]">
            {languages.map(lang => (
              <button
                key={lang.code}
                onClick={() => { setLanguage(lang.code); setIsOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-2 hover:bg-primary-50 transition-colors ${
                  language === lang.code ? 'bg-primary-50 text-primary-600 font-medium' : 'text-gray-700'
                }`}
              >
                <span className="text-xl">{lang.flag}</span>
                <span>{lang.label}</span>
                {language === lang.code && <Check className="w-4 h-4 ml-auto" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function AppContent() {
  const { language, t } = useLanguage()
  const [activeTab, setActiveTab] = useState('breakfast')
  const [approvedMeals, setApprovedMeals] = useState({
    breakfast: null,
    lunch: null,
    dinner: null,
  })
  const [generatingMeal, setGeneratingMeal] = useState({
    breakfast: false,
    lunch: false,
    dinner: false,
  })
  const [aiGenerating, setAiGenerating] = useState({
    breakfast: false,
    lunch: false,
    dinner: false,
  })
  const [apiError, setApiError] = useState(null)
  const [openaiApiKey, setOpenaiApiKey] = useState(getApiKey())

  const currentMealData = getMealData(language)

  const getRandomMeal = (category) => {
    return currentMealData[category][Math.floor(Math.random() * currentMealData[category].length)]
  }

  const getDisplayMeal = (meal, category) => {
    if (!meal) return null
    if (!meal.hasAllLanguages || !meal.originalName) return meal
    
    const allData = getAllMealData()
    const localizedMeal = findMealByName(meal.originalName, category, language)
    
    if (localizedMeal) {
      return {
        ...meal,
        name: localizedMeal.name,
        description: meal.aiGenerated ? meal.description : localizedMeal.description,
        steps: meal.aiGenerated ? meal.steps : localizedMeal.steps,
      }
    }
    
    return meal
  }

  const getAllMealData = () => ({
    zh: mealData,
    en: mealDataEn,
    id: mealDataId,
  })

  const findMealByName = (name, category, lang) => {
    const allData = getAllMealData()
    const mealList = allData[lang]?.[category] || allData.zh[category]
    return mealList.find(m => m.name === name)
  }

  const generateMealWithAI = async (category) => {
    const baseMeal = getRandomMeal(category)
    setGeneratingMeal(prev => ({ ...prev, [category]: true }))
    setAiGenerating(prev => ({ ...prev, [category]: true }))
    setApiError(null)

    if (!openaiApiKey) {
      setApprovedMeals(prev => ({ 
        ...prev, 
        [category]: { 
          ...baseMeal, 
          originalName: baseMeal.name,
          hasAllLanguages: true
        }
      }))
      setGeneratingMeal(prev => ({ ...prev, [category]: false }))
      setTimeout(() => setAiGenerating(prev => ({ ...prev, [category]: false })), 500)
      return
    }

    try {
      console.log('Calling Groq API for:', baseMeal.name)
      const aiDetails = await generateMealDetails(baseMeal.name, language, openaiApiKey)
      console.log('AI Response:', aiDetails)
      setApprovedMeals(prev => ({ 
        ...prev, 
        [category]: { 
          ...baseMeal, 
          description: aiDetails.description,
          steps: aiDetails.steps,
          aiGenerated: true,
          originalName: baseMeal.name,
          hasAllLanguages: true
        } 
      }))
    } catch (error) {
      console.error('AI generation failed:', error)
      setApiError(error.message)
      setApprovedMeals(prev => ({ 
        ...prev, 
        [category]: { 
          ...baseMeal, 
          aiGenerated: false,
          originalName: baseMeal.name,
          hasAllLanguages: true
        }
      }))
    } finally {
      setGeneratingMeal(prev => ({ ...prev, [category]: false }))
      setTimeout(() => {
        setAiGenerating(prev => ({ ...prev, [category]: false }))
      }, 500)
    }
  }

  const handleApiKeyChange = (key) => {
    setOpenaiApiKey(key)
  }

  const approveMeal = (category) => {
    if (approvedMeals[category]) {
      setApprovedMeals(prev => ({ ...prev, [category]: { ...prev[category], approved: true } }))
    }
  }

  const tabs = [
    { id: 'breakfast', label: t('breakfast'), icon: Sun },
    { id: 'lunch', label: t('lunch'), icon: Utensils },
    { id: 'dinner', label: t('dinner'), icon: Moon },
    { id: 'chart', label: t('nutrition'), icon: BarChart3 },
  ]

  const getMealIcon = (category) => {
    switch(category) {
      case 'breakfast': return <Sun className="w-6 h-6" />
      case 'lunch': return <Utensils className="w-6 h-6" />
      case 'dinner': return <Moon className="w-6 h-6" />
      default: return null
    }
  }

  const getCategoryColor = (category) => {
    switch(category) {
      case 'breakfast': return 'from-amber-400 to-orange-500'
      case 'lunch': return 'from-emerald-400 to-teal-500'
      case 'dinner': return 'from-indigo-400 to-purple-500'
      default: return 'from-primary-400 to-primary-600'
    }
  }

  const getCategoryLabel = (category) => {
    switch(category) {
      case 'breakfast': return t('breakfast')
      case 'lunch': return t('lunch')
      case 'dinner': return t('dinner')
      default: return ''
    }
  }

  const approvedMealsArray = Object.entries(approvedMeals)
    .filter(([key, value]) => value !== null)
    .map(([key, value]) => ({ ...value, category: key }))

  return (
    <div className="min-h-screen pb-8">
      <header className="bg-gradient-to-r from-primary-600 to-primary-500 text-white py-6 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-8 h-8" />
              <div>
                <h1 className="text-2xl font-bold">{t('title')}</h1>
                <p className="text-primary-100 mt-1 hidden sm:block">
                  {openaiApiKey ? '🤖 AI Ready - Powered by Groq (FREE)' : '⚙️ Set API Key for AI Generation'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ApiKeySettings onApiKeyChange={handleApiKeyChange} />
              <LanguageSelector />
            </div>
          </div>
        </div>
      </header>

      <nav className="container mx-auto px-4 mt-6">
        <div className="bg-white rounded-2xl shadow-lg p-2 flex gap-2 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-primary-50'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="container mx-auto px-4 mt-6">
        {activeTab !== 'chart' ? (
          <div className="flex justify-center">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden w-full">
              <div className={`bg-gradient-to-r ${getCategoryColor(activeTab)} p-4 text-white`}>
                <div className="flex items-center gap-2">
                  {getMealIcon(activeTab)}
                  <h2 className="text-xl font-bold">{getCategoryLabel(activeTab)}</h2>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-primary-50 to-emerald-50 rounded-2xl p-5 border border-primary-100">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-primary-600" />
                      {language === 'id' ? 'Pemilihan Menu' : language === 'en' ? 'Meal Selection' : '選擇菜單'}
                    </h3>
                    {approvedMeals[activeTab] ? (
                      <MealCard meal={getDisplayMeal(approvedMeals[activeTab], activeTab)} />
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Sparkles className="w-12 h-12 mx-auto mb-2 text-primary-300" />
                        <p>{t('noMeal')}</p>
                      </div>
                    )}
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => generateMealWithAI(activeTab)}
                        disabled={generatingMeal[activeTab]}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all ${
                          generatingMeal[activeTab]
                            ? 'bg-gray-200 text-gray-500'
                            : 'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:shadow-md'
                        }`}
                      >
                        <RotateCcw className={`w-4 h-4 ${generatingMeal[activeTab] ? 'animate-spin' : ''}`} />
                        {generatingMeal[activeTab] ? t('approving') : t('generateMeal')}
                      </button>
                      
                      {approvedMeals[activeTab] && (
                        <button
                          onClick={() => approveMeal(activeTab)}
                          className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
                            approvedMeals[activeTab].approved
                              ? 'bg-primary-100 text-primary-600'
                              : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:shadow-md'
                          }`}
                        >
                          <Check className="w-4 h-4" />
                          {approvedMeals[activeTab].approved ? t('confirmed') : t('approve')}
                        </button>
                      )}
                    </div>
                    
                    {apiError && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs">
                        <strong>API Error:</strong> {apiError}
                      </div>
                    )}
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-100">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <Utensils className="w-5 h-5 text-blue-600" />
                      {language === 'id' ? 'Deskripsi' : language === 'en' ? 'Description' : '描述'}
                      {aiGenerating[activeTab] && (
                        <span className="ml-auto text-xs bg-gradient-to-r from-amber-400 to-orange-400 text-white px-2 py-1 rounded-full animate-pulse">
                          AI...
                        </span>
                      )}
                      {!aiGenerating[activeTab] && approvedMeals[activeTab]?.aiGenerated && (
                        <span className="ml-auto text-xs bg-gradient-to-r from-amber-400 to-orange-400 text-white px-2 py-1 rounded-full">
                          AI ✓
                        </span>
                      )}
                      {!aiGenerating[activeTab] && approvedMeals[activeTab] && !approvedMeals[activeTab]?.aiGenerated && (
                        <span className="ml-auto text-xs bg-gray-300 text-gray-600 px-2 py-1 rounded-full">
                          Default
                        </span>
                      )}
                    </h3>
                    {aiGenerating[activeTab] ? (
                      <div className="text-center py-8">
                        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-3"></div>
                        <p className="text-blue-600 text-sm">{t('generatingDescription')}</p>
                      </div>
                    ) : approvedMeals[activeTab] ? (
                      <MealDescription meal={getDisplayMeal(approvedMeals[activeTab], activeTab)} showSteps={false} />
                    ) : (
                      <div className="text-center py-8 text-gray-400">
                        <Utensils className="w-12 h-12 mx-auto mb-2 text-blue-200" />
                        <p className="text-sm">{t('noMeal')}</p>
                      </div>
                    )}
                  </div>

                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 border border-amber-100">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-amber-600" />
                      {language === 'id' ? 'Langkah Memasak' : language === 'en' ? 'Cooking Steps' : '烹飪步驟'}
                      {aiGenerating[activeTab] && (
                        <span className="ml-auto text-xs bg-gradient-to-r from-amber-400 to-orange-400 text-white px-2 py-1 rounded-full animate-pulse">
                          AI...
                        </span>
                      )}
                      {!aiGenerating[activeTab] && approvedMeals[activeTab]?.aiGenerated && (
                        <span className="ml-auto text-xs bg-gradient-to-r from-amber-400 to-orange-400 text-white px-2 py-1 rounded-full">
                          AI ✓
                        </span>
                      )}
                      {!aiGenerating[activeTab] && approvedMeals[activeTab] && !approvedMeals[activeTab]?.aiGenerated && (
                        <span className="ml-auto text-xs bg-gray-300 text-gray-600 px-2 py-1 rounded-full">
                          Default
                        </span>
                      )}
                    </h3>
                    {aiGenerating[activeTab] ? (
                      <div className="text-center py-8">
                        <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full mx-auto mb-3"></div>
                        <p className="text-amber-600 text-sm">{t('generatingSteps')}</p>
                      </div>
                    ) : approvedMeals[activeTab] ? (
                      <MealDescription meal={getDisplayMeal(approvedMeals[activeTab], activeTab)} showDescription={false} />
                    ) : (
                      <div className="text-center py-8 text-gray-400">
                        <BarChart3 className="w-12 h-12 mx-auto mb-2 text-amber-200" />
                        <p className="text-sm">{t('noMeal')}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-primary-600" />
              {t('nutrition')}
            </h2>
            
            {approvedMealsArray.length > 0 ? (
              <NutritionChart meals={approvedMealsArray} />
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Utensils className="w-16 h-16 mx-auto mb-4 text-primary-300" />
                <p className="text-lg">{t('generateFirst')}</p>
                <p className="text-sm mt-2">{t('generateHint')}</p>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="container mx-auto px-4 mt-8 text-center text-gray-500 text-sm">
        <p>AI {t('title')} - 健康飲食，從今天開始 / Healthy eating, start today / Makan sehat, mulai hari ini</p>
      </footer>
    </div>
  )
}

function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  )
}

export default App
