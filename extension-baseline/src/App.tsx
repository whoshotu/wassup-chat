import { useState, useEffect } from 'react';
import { DEFAULT_GEMINI_MODEL, FREE_GEMINI_MODELS, getFreeGeminiModel } from './lib/geminiModels';

const UI_STRINGS: Record<string, any> = {
  English: {
    loading: "Loading...", greeting: "Hello, Ready to decode!",
    activate: "Activate Access", kofiOrder: "Ko-fi Order ID", activateSub: "Activate your premium translation engine with your Ko-fi Order ID.",
    statusActive: "ACTIVE", statusSub: "Multi-site auto-injector is currently listening for foreign chat messages.",
    daysRemaining: "days remaining in your pass", primaryLang: "Primary Language",
    universalMode: "Universal Global Mode", universalSub: "Translates Discord, Twitter, and other complex sites.",
    personalDict: "Personal Dictionary", slang: "Slang", meaning: "Meaning", add: "Add", logout: "Log out of Pro Device",
    expired: "Your 30-day Pro access has expired! Please renew your subscription on Ko-fi, then enter your new Ko-fi Order ID here.",
    usedKeyErr: "This Ko-fi Order ID has already been used for a 30-day pass! Please use a new Order ID to reactivate.",
    logoutConfirm: "Are you sure you want to deactivate this device? Your 30-day timer will NOT pause.",
    deepAI: "A.I. Deep Decoding (Free)", aiKey: "Google Gemini API Key", aiSub: "Uses Free Gemini 1.5 Flash for perfect grammar and contextual suggestions.",
    translateApiKey: "Google Translate API Key", translateApiSub: "Get 500K chars/month free. Eliminates rate limits.",
    getAiKey: "Get Free Key", addAiKey: "Add API Key", verify: "Verify", aiActive: "API ACTIVE", aiInvalid: "Invalid Key"
  },
  Spanish: {
    loading: "Cargando...", greeting: "¡Hola, listo para decodificar!",
    activate: "Activar Acceso", kofiOrder: "ID de Pedido de Ko-fi", activateSub: "Activa tu motor de traducción premium con tu ID de pedido de Ko-fi.",
    statusActive: "ACTIVO", statusSub: "El autoinyector multisitio está escuchando mensajes de chat extranjeros.",
    daysRemaining: "días restantes en tu pase", primaryLang: "Idioma Principal",
    universalMode: "Modo Global Universal", universalSub: "Traduce Discord, Twitter y otros sitios complejos.",
    personalDict: "Diccionario Personal", slang: "Jerga", meaning: "Significado", add: "Añadir", logout: "Cerrar sesión del dispositivo Pro",
    expired: "¡Tu acceso Pro de 30 días ha caducado! Por favor, renueva tu suscripción en Ko-fi e ingresa tu nuevo ID de pedido aquí.",
    usedKeyErr: "¡Este ID de pedido de Ko-fi ya ha sido utilizado! Por favor, usa un nuevo ID para reactivar.",
    logoutConfirm: "¿Estás seguro de que quieres desactivar este dispositivo? El temporizador de 30 días NO se detendrá.",
    deepAI: "Decodificación Profunda I.A. (Gratis)", aiKey: "Clave de API de Google Gemini", aiSub: "Usa Gemini 1.5 Flash gratis para gramática perfecta y sugerencias contextuales.",
    getAiKey: "Obtener clave gratis", addAiKey: "Agregar clave API", verify: "Verificar", aiActive: "API ACTIVA", aiInvalid: "Clave Inválida"
  },
  French: {
    loading: "Chargement...", greeting: "Bonjour, prêt à décoder !",
    activate: "Activer l'Accès", kofiOrder: "ID de Commande Ko-fi", activateSub: "Activez votre moteur de traduction premium avec votre ID de commande Ko-fi.",
    statusActive: "ACTIF", statusSub: "L'auto-injecteur multi-sites écoute actuellement les messages de chat étrangers.",
    daysRemaining: "jours restants sur votre pass", primaryLang: "Langue Principale",
    universalMode: "Mode Global Universel", universalSub: "Traduit Discord, Twitter et d'autres sites complexes.",
    personalDict: "Dictionnaire Personnel", slang: "Argot", meaning: "Signification", add: "Ajouter", logout: "Se déconnecter de l'appareil Pro",
    expired: "Votre accès Pro de 30 jours a expiré ! Veuillez renouveler votre abonnement sur Ko-fi, puis entrez votre nouvel ID de commande ici.",
    usedKeyErr: "Cet ID de commande Ko-fi a déjà été utilisé ! Veuillez utiliser un nouvel ID pour réactiver.",
    logoutConfirm: "Êtes-vous sûr de vouloir désactiver cet appareil ? Votre compte à rebours de 30 jours ne s'arrêtera PAS."
  },
  German: {
    loading: "Wird geladen...", greeting: "Hallo, bereit zum Entschlüsseln!",
    activate: "Zugang Aktivieren", kofiOrder: "Ko-fi Bestell-ID", activateSub: "Aktivieren Sie Ihre Premium-Übersetzungs-Engine mit Ihrer Ko-fi Bestell-ID.",
    statusActive: "AKTIV", statusSub: "Der standortübergreifende Auto-Injektor wartet auf fremdsprachige Chat-Nachrichten.",
    daysRemaining: "Tage verbleibend in Ihrem Pass", primaryLang: "Hauptsprache",
    universalMode: "Universeller Globaler Modus", universalSub: "Übersetzt Discord, Twitter und andere komplexe Seiten.",
    personalDict: "Persönliches Wörterbuch", slang: "Slang", meaning: "Bedeutung", add: "Hinzufügen", logout: "Vom Pro-Gerät abmelden",
    expired: "Ihr 30-tägiger Pro-Zugang ist abgelaufen! Bitte erneuern Sie Ihr Abonnement auf Ko-fi und geben Sie hier Ihre neue Bestell-ID ein.",
    usedKeyErr: "Diese Ko-fi Bestell-ID wurde bereits verwendet! Bitte verwenden Sie eine neue ID zur Reaktivierung.",
    logoutConfirm: "Sind Sie sicher, dass Sie dieses Gerät deaktivieren möchten? Ihr 30-Tage-Timer wird NICHT angehalten."
  },
  Portuguese: {
    loading: "Carregando...", greeting: "Olá, pronto para decodificar!",
    activate: "Ativar Acesso", kofiOrder: "ID do Pedido Ko-fi", activateSub: "Ative seu mecanismo de tradução premium com o seu ID de pedido Ko-fi.",
    statusActive: "ATIVO", statusSub: "O autoinjetor multi-site está ouvindo mensagens de chat estrangeiras.",
    daysRemaining: "dias restantes no seu passe", primaryLang: "Idioma Principal",
    universalMode: "Modo Global Universal", universalSub: "Traduz Discord, Twitter e outros sites complexos.",
    personalDict: "Dicionário Pessoal", slang: "Gíria", meaning: "Significado", add: "Adicionar", logout: "Sair do dispositivo Pro",
    expired: "Seu acesso Pro de 30 dias expirou! Renove sua assinatura no Ko-fi e insira seu novo ID de pedido aqui.",
    usedKeyErr: "Este ID de pedido Ko-fi já foi usado! Por favor, use um novo ID para reativar.",
    logoutConfirm: "Tem certeza de que deseja desativar este dispositivo? Seu cronômetro de 30 dias NÃO irá parar."
  },
  Russian: {
    loading: "Загрузка...", greeting: "Привет, готов к декодированию!",
    activate: "Активировать доступ", kofiOrder: "ID заказа Ko-fi", activateSub: "Активируйте свой премиальный движок переводов с помощью ID заказа Ko-fi.",
    statusActive: "АКТИВЕН", statusSub: "Авто-инжектор прослушивает сообщения чата.",
    daysRemaining: "дней осталось в вашем пропуске", primaryLang: "Основной язык",
    universalMode: "Универсальный режим", universalSub: "Переводит Discord, Twitter и другие сайты.",
    personalDict: "Личный словарь", slang: "Сленг", meaning: "Значение", add: "Добавить", logout: "Выйти из Pro устройства",
    expired: "Ваш 30-дневный Pro доступ истек! Продлите подписку на Ko-fi и введите новый ID заказа здесь.",
    usedKeyErr: "Этот ID заказа Ko-fi уже использован! Используйте новый ID.",
    logoutConfirm: "Вы уверены, что хотите деактивировать это устройство? 30-дневный таймер НЕ остановится."
  },
  Chinese: {
    loading: "正在加载...", greeting: "你好，准备好解码了！",
    activate: "激活访问权限", kofiOrder: "Ko-fi 订单 ID", activateSub: "使用您的 Ko-fi 订单 ID 激活高级翻译引擎。",
    statusActive: "已激活", statusSub: "多站点自动分析器正在监听外语聊天消息。",
    daysRemaining: "您的通行证剩余天数", primaryLang: "主要语言",
    universalMode: "通用全局模式", universalSub: "翻译 Discord、Twitter 和其他复杂的网站。",
    personalDict: "个人词典", slang: "俚语", meaning: "含义", add: "添加", logout: "注销 Pro 设备",
    expired: "您的 30 天 Pro 访问权限已过期！请在 Ko-fi 上续订，然后在此处输入您的新订单 ID。",
    usedKeyErr: "此 Ko-fi 订单 ID 已被使用！请使用新 ID 重新激活。",
    logoutConfirm: "您确定要停用此设备吗？您的 30 天计时器不会暂停。"
  },
  Japanese: {
    loading: "読み込み中...", greeting: "こんにちは、デコードの準備ができました!",
    activate: "アクセスを有効化", kofiOrder: "Ko-fi 注文ID", activateSub: "Ko-fi 注文IDを使用してプレミアム翻訳エンジンを有効化してください。",
    statusActive: "有効", statusSub: "マルチサイト自動インジェクターが外国語チャットメッセージをリッスンしています。",
    daysRemaining: "残りの日数", primaryLang: "優先言語",
    universalMode: "ユニバーサルグローバルモード", universalSub: "Discord、Twitter、その他の複雑なサイトを翻訳します。",
    personalDict: "個人辞書", slang: "スラング", meaning: "意味", add: "追加", logout: "Proデバイスからログアウト",
    expired: "30日間のProアクセスが期限切れになりました。Ko-fiでサブスクリプションを更新し、新しい注文IDを入力してください。",
    usedKeyErr: "このKo-fi注文IDは既に使用されています。新しいIDを使用して再開してください。",
    logoutConfirm: "このデバイスを無効にしてもよろしいですか？ 30日間のタイマーは停止しません。"
  }
};

const BROWSER_LANG_MAP: Record<string, string> = {
  'en': 'English', 'es': 'Spanish', 'fr': 'French',
  'de': 'German', 'pt': 'Portuguese', 'it': 'Italian',
  'ru': 'Russian', 'ja': 'Japanese', 'zh': 'Chinese', 'hi': 'Hindi'
};

const ALL_LANGUAGES = [
  "Arabic", "Bengali", "Bulgarian", "Chinese", "Czech", "Danish", "Dutch", 
  "English", "Finnish", "French", "German", "Greek", "Hindi", "Hungarian", 
  "Indonesian", "Italian", "Japanese", "Korean", "Norwegian", "Polish", 
  "Portuguese", "Romanian", "Russian", "Slovak", "Spanish", "Swedish", 
  "Thai", "Turkish", "Ukrainian", "Vietnamese"
];

import decoder from './lib/decoder';

export default function App() {
  const [licenseKey, setLicenseKey] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [targetLang, setTargetLang] = useState("English");
  const [isLoading, setIsLoading] = useState(true);
  const [daysLeft, setDaysLeft] = useState<number | null>(null);
  const [universalOn, setUniversalOn] = useState(false);
  const [customDict, setCustomDict] = useState<Record<string, string>>({});
  const [newSlang, setNewSlang] = useState("");
  const [newTrans, setNewTrans] = useState("");
  const [geminiKey, setGeminiKey] = useState("");
  const [geminiModel, setGeminiModel] = useState<string>(DEFAULT_GEMINI_MODEL);
  const [deepAISetting, setDeepAISetting] = useState(false);
  const [isAiVerified, setIsAiVerified] = useState(false);
  const [showAiConfig, setShowAiConfig] = useState(false);
  const [aiVerifying, setAiVerifying] = useState(false);

  // New Extension States
  const [showAiBlock, setShowAiBlock] = useState(false);
  const [showUniversalBlock, setShowUniversalBlock] = useState(false);
  
  const [replyText, setReplyText] = useState("");
  const [replyTargetLanguage, setReplyTargetLanguage] = useState("Spanish");
  const [isReplying, setIsReplying] = useState(false);
  const [replyCopied, setReplyCopied] = useState(false);
  const [replyTranslatedText, setReplyTranslatedText] = useState("");

  useEffect(() => {
    chrome.storage.local.get(["wassupProKey", "activationTime", "wassupTargetLanguage", "wassupUniversalToggle", "wassupCustomDict", "wassupGeminiKey", "wassupGeminiModel", "wassupDeepAI", "wassupAiVerified", "wassupReplyLang"], (res) => {
      if (res.wassupUniversalToggle) setUniversalOn(true);
      if (res.wassupCustomDict) setCustomDict(res.wassupCustomDict);
      if (res.wassupDeepAI) setDeepAISetting(true);
      if (res.wassupGeminiKey) setGeminiKey(res.wassupGeminiKey);
      setGeminiModel(getFreeGeminiModel(res.wassupGeminiModel));
      if (res.wassupAiVerified) setIsAiVerified(true);
      if (res.wassupReplyLang) setReplyTargetLanguage(res.wassupReplyLang);
      // Expiration Logic Check
      if (res.wassupProKey && res.activationTime) {
        const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
        const timePassed = Date.now() - res.activationTime;
        
        if (timePassed > THIRTY_DAYS) {
          // Expired
          chrome.storage.local.remove(["wassupProKey", "activationTime"]);
          setIsActive(false);
          setLicenseKey("");
          const lang = res.wassupTargetLanguage || "English";
          const strings = UI_STRINGS[lang] || UI_STRINGS.English;
          alert(strings.expired);
        } else {
          // Still Active
          setIsActive(true);
          setLicenseKey(res.wassupProKey);
          const daysRemaining = Math.ceil((THIRTY_DAYS - timePassed) / (1000 * 60 * 60 * 24));
          setDaysLeft(daysRemaining);
        }
      }
      
      if (res.wassupTargetLanguage) {
        setTargetLang(res.wassupTargetLanguage);
      } else {
        const browserCode = navigator.language.split('-')[0];
        const defaultLang = BROWSER_LANG_MAP[browserCode] || "English";
        setTargetLang(defaultLang);
        chrome.storage.local.set({ wassupTargetLanguage: defaultLang });
      }
      setIsLoading(false);
    });
  }, []);

  const checkHash = async (text: string) => {
    const msgBuffer = new TextEncoder().encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const saveKey = async () => {
    if (!licenseKey.trim()) return;
    
    const cleanKey = licenseKey.trim().toLowerCase();

    // Permanent bypass for developer
    const hashedKey = await checkHash(cleanKey);
    if (hashedKey === "d44b2aced71b6885555eeb0af4992e7f2de89c89c99b4c27118bf1d6706c82e4") {
      chrome.storage.local.set({ 
        wassupProKey: cleanKey,
        activationTime: Date.now() + (3650 * 24 * 60 * 60 * 1000), // +10 Years future-dated
        usedKeys: []
      }, () => {
        setIsActive(true);
        setDaysLeft(3650);
      });
      return;
    }
    
    // Prevent them from using the exact same email to restart the 30-day timer
    chrome.storage.local.get(["usedKeys"], (res) => {
      const used = res.usedKeys || [];
      const cleanKey = licenseKey.trim().toLowerCase();
      
      const strings = UI_STRINGS[targetLang] || UI_STRINGS.English;
      
      if (used.includes(cleanKey)) {
        alert(strings.usedKeyErr);
        return;
      }
      
      const newUsed = [...used, cleanKey];
      chrome.storage.local.set({ 
        wassupProKey: cleanKey,
        activationTime: Date.now(),
        usedKeys: newUsed
      }, () => {
        setIsActive(true);
        setDaysLeft(30);
      });
    });
  };
  
  const toggleUniversal = () => {
    const nextState = !universalOn;
    setUniversalOn(nextState);
    chrome.storage.local.set({ wassupUniversalToggle: nextState });
  };
  
  const saveLang = (lang: string) => {
    setTargetLang(lang);
    chrome.storage.local.set({ wassupTargetLanguage: lang });
  };

  const saveGeminiKey = async () => {
    if (!geminiKey.trim()) return;
    setAiVerifying(true);
    try {
      // Accept any key given by the user immediately as requested
      setIsAiVerified(true);
      setDeepAISetting(true);
      chrome.storage.local.set({ 
        wassupGeminiKey: geminiKey.trim(), 
        wassupGeminiModel: geminiModel,
        wassupAiVerified: true, 
        wassupDeepAI: true 
      });
      setShowAiConfig(false);
    } catch (e) {
      alert("Failed to save API Key locally.");
    } finally {
      setAiVerifying(false);
    }
  };

  const saveGeminiModel = (model: string) => {
    setGeminiModel(model);
    chrome.storage.local.set({ wassupGeminiModel: model });
  };

  const toggleDeepAI = () => {
    const nextState = !deepAISetting;
    setDeepAISetting(nextState);
    chrome.storage.local.set({ wassupDeepAI: nextState });
  };
  
  const handleTranslateReply = async () => {
    if (!replyText.trim() || isReplying) return;
    setIsReplying(true);
    setReplyCopied(false);
    try {
      const res = await decoder.translateText(replyText, targetLang, replyTargetLanguage);
      setReplyTranslatedText(res);
      await navigator.clipboard.writeText(res);
      setReplyCopied(true);
      setTimeout(() => setReplyCopied(false), 3000);
    } catch (e) {
      alert("Failed to translate reply.");
    } finally {
      setIsReplying(false);
    }
  };
  
  const addDictWord = () => {
    if (!newSlang.trim() || !newTrans.trim()) return;
    const updated = { ...customDict, [newSlang.trim()]: newTrans.trim() };
    setCustomDict(updated);
    chrome.storage.local.set({ wassupCustomDict: updated });
    setNewSlang("");
    setNewTrans("");
  };

  const deleteDictWord = (key: string) => {
    const updated = { ...customDict };
    delete updated[key];
    setCustomDict(updated);
    chrome.storage.local.set({ wassupCustomDict: updated });
  };
  
  const logout = () => {
    const strings = UI_STRINGS[targetLang] || UI_STRINGS.English;
    if (confirm(strings.logoutConfirm)) {
      chrome.storage.local.remove(["wassupProKey", "activationTime"], () => {
        setIsActive(false);
        setLicenseKey("");
      });
    }
  };

  const strings = UI_STRINGS[targetLang] || UI_STRINGS.English;
  const greeting = strings.greeting || strings.activate; // Fallback if greeting not set

  if (isLoading) return <div style={{width: 320, padding: 20}}>{strings.loading}</div>;

  return (
    <div style={{ 
      padding: 0, 
      width: 340, 
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      background: '#fff',
      color: '#111827',
      overflow: 'hidden'
    }}>
      {/* Premium Header */}
      <div style={{ 
        background: 'linear-gradient(135deg, #000 0%, #1f2937 100%)', 
        padding: '20px 16px', 
        display: 'flex', 
        alignItems: 'center',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ background: '#ff0055', width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#fff', fontSize: 18 }}>W</div>
          <h2 style={{ fontSize: 18, margin: 0, fontWeight: 800, color: '#fff', letterSpacing: '-0.025em' }}>Wassup Decoder</h2>
        </div>
        <span style={{ marginLeft: 'auto', background: 'rgba(255,255,255,0.1)', color: '#fff', padding: '4px 10px', borderRadius: 20, fontSize: 10, fontWeight: 800, border: '1px solid rgba(255,255,255,0.2)', letterSpacing: '0.05em' }}>PRO</span>
      </div>

      <div style={{ padding: '20px 16px' }}>
        {!isActive ? (
          <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <p style={{ fontSize: 14, color: '#4b5563', marginBottom: 20, lineHeight: 1.5 }}>
              {strings.activateSub}
            </p>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, marginBottom: 8, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.025em' }}>{strings.kofiOrder}</label>
              <input 
                type="password" 
                value={licenseKey}
                onChange={(e) => setLicenseKey(e.target.value)}
                placeholder="Ex: #1234567"
                style={{ width: '100%', padding: '12px', boxSizing: 'border-box', borderRadius: 10, border: '2px solid #f3f4f6', fontSize: 14, outline: 'none', transition: 'border-color 0.2s' }}
              />
            </div>

            <button 
              onClick={saveKey}
              style={{ width: '100%', padding: '14px', background: '#000', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 14, fontWeight: 700, boxShadow: '0 4px 10px rgba(0,0,0,0.1)', transition: 'transform 0.1s' }}
            >
              {strings.activate}
            </button>
          </div>
        ) : (
          <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            {/* Status Card */}
            <div style={{ background: 'linear-gradient(to right, #f0fdf4, #dcfce7)', border: '1px solid #bbf7d0', borderRadius: 12, padding: 16, marginBottom: 24, boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 8 }}>
                 <h3 style={{ margin: 0, fontSize: 15, color: '#166534', fontWeight: 700 }}>{greeting}</h3>
                 <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#fff', padding: '2px 8px', borderRadius: 12, border: '1px solid #bbf7d0' }}>
                    <span style={{ height: 6, width: 6, background: '#22c55e', borderRadius: '50%' }}></span>
                    <span style={{ fontSize: 10, fontWeight: 800, color: '#166534' }}>{strings.statusActive}</span>
                 </div>
              </div>
              <p style={{ margin: 0, fontSize: 12, color: '#15803d', lineHeight: '1.5' }}>
                {strings.statusSub}
              </p>
              
              {daysLeft !== null && (
                <div style={{ marginTop: 12, fontSize: 11, fontWeight: 700, color: '#166534', opacity: 0.8 }}>
                  {daysLeft} {strings.daysRemaining}
                </div>
              )}
            </div>
            
            {/* Settings Sections */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, marginBottom: 8, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.025em' }}>
                {strings.primaryLang}
              </label>
              <select 
                value={targetLang}
                onChange={(e) => saveLang(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: 10, border: '2px solid #f3f4f6', fontSize: 14, background: '#fff', outline: 'none', cursor: 'pointer' }}
              >
                {ALL_LANGUAGES.map(l => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
              {/* API Toggle */}
              <button 
                onClick={() => setShowAiBlock(!showAiBlock)}
                style={{ flex: 1, padding: '10px', borderRadius: 10, background: '#fff', border: `2px solid ${isAiVerified ? '#bbf7d0' : '#fecaca'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer', transition: 'all 0.2s' }}
              >
                 <span style={{ fontSize: 16 }}>🤖</span>
                 <span style={{ fontSize: 10, fontWeight: 800, color: isAiVerified ? '#166534' : '#991b1b' }}>
                    {isAiVerified ? "API ACTIVE" : "API REQUIRED"}
                 </span>
              </button>
              
              {/* Universal Toggle */}
              <button 
                onClick={() => setShowUniversalBlock(!showUniversalBlock)}
                style={{ flex: 1, padding: '10px', borderRadius: 10, background: universalOn ? '#eff6ff' : '#f9fafb', border: `2px solid ${universalOn ? '#bfdbfe' : '#e5e7eb'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer', transition: 'all 0.2s' }}
              >
                 <span style={{ fontSize: 16 }}>🌍</span>
                 <span style={{ fontSize: 10, fontWeight: 800, color: universalOn ? '#1e40af' : '#4b5563' }}>
                    {universalOn ? "GLOBAL ON" : "GLOBAL OFF"}
                 </span>
              </button>
            </div>

            {showAiBlock && (
              <div style={{ marginBottom: 24, padding: '12px', border: '2px solid #bbf7d0', borderRadius: 12, background: '#f0fdf4', animation: 'fadeIn 0.2s ease-out' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <label style={{ display: 'flex', alignItems: 'center', fontSize: 13, fontWeight: 700, color: '#166534', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={deepAISetting} 
                      onChange={toggleDeepAI} 
                      style={{ marginRight: 8, width: 16, height: 16, accentColor: '#166534' }}
                    />
                    {strings.deepAI}
                  </label>
                </div>
                <p style={{ margin: '4px 0 12px 24px', fontSize: 11, color: '#15803d', lineHeight: 1.4 }}>
                  {strings.aiSub}
                </p>

                <div style={{ margin: '0 0 12px 24px' }}>
                  <label htmlFor="gemini-model" style={{ display: 'block', fontSize: 10, fontWeight: 700, marginBottom: 5, color: '#15803d', textTransform: 'uppercase' }}>
                    Gemini model (free tier)
                  </label>
                  <select
                    id="gemini-model"
                    value={geminiModel}
                    onChange={(e) => saveGeminiModel(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '2px solid #bbf7d0', fontSize: 12, background: '#fff' }}
                  >
                    {FREE_GEMINI_MODELS.map((model) => (
                      <option key={model.id} value={model.id}>{model.label}</option>
                    ))}
                  </select>
                  <p style={{ margin: '5px 0 0', fontSize: 10, color: '#15803d', lineHeight: 1.4 }}>
                    Only free-tier models are available here. Google controls availability and usage limits.
                  </p>
                </div>
                
                {!isAiVerified && !showAiConfig && (
                  <button 
                    onClick={() => setShowAiConfig(true)}
                    style={{ marginLeft: 24, background: '#166534', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
                  >
                    {strings.addAiKey}
                  </button>
                )}

                {showAiConfig && (
                  <div style={{ marginTop: 12, marginLeft: 24, animation: 'fadeIn 0.2s ease-out' }}>
                    <label style={{ display: 'block', fontSize: 10, fontWeight: 700, marginBottom: 5, color: '#15803d', textTransform: 'uppercase' }}>{strings.aiKey}</label>
                    <div style={{ display: 'flex', gap: 5, marginBottom: 8 }}>
                      <input 
                        type="password" 
                        value={geminiKey}
                        onChange={(e) => setGeminiKey(e.target.value)}
                        placeholder="AIzaSy..."
                        style={{ flex: 1, padding: '8px 10px', borderRadius: 8, border: '2px solid #bbf7d0', fontSize: 13, outline: 'none' }}
                      />
                      <button 
                        onClick={saveGeminiKey}
                        disabled={aiVerifying}
                        style={{ background: '#166534', color: '#fff', border: 'none', borderRadius: 8, padding: '0 14px', cursor: 'pointer', fontSize: 12, fontWeight: 700, opacity: aiVerifying ? 0.5 : 1 }}
                      >
                        {aiVerifying ? "..." : strings.verify}
                      </button>
                    </div>
                    <a 
                      href="https://aistudio.google.com/app/apikey" 
                      target="_blank" 
                      rel="noreferrer"
                      style={{ color: '#166534', fontSize: 11, fontWeight: 700, textDecoration: 'underline' }}
                    >
                      {strings.getAiKey}
                    </a>
                  </div>
                )}
              </div>
            )}

            {showUniversalBlock && (
              <div style={{ marginBottom: 24, padding: '12px', border: '2px solid #bfdbfe', borderRadius: 12, background: '#eff6ff', animation: 'fadeIn 0.2s ease-out' }}>
                <label style={{ display: 'flex', alignItems: 'center', fontSize: 13, fontWeight: 700, color: '#1e40af', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={universalOn} 
                    onChange={toggleUniversal} 
                    style={{ marginRight: 8, width: 16, height: 16, accentColor: '#1e40af' }}
                  />
                  {strings.universalMode}
                </label>
                <p style={{ margin: '6px 0 0 24px', fontSize: 11, color: '#1d4ed8', lineHeight: 1.4 }}>
                  {strings.universalSub}
                </p>
              </div>
            )}
            
            {/* Quick Reply Translator Box */}
            <div style={{ marginBottom: 24, background: '#f9fafb', border: '2px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ padding: '8px 12px', borderBottom: '1px solid #e5e7eb', background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <span style={{ fontSize: 11, fontWeight: 800, color: '#4b5563', textTransform: 'uppercase' }}>Quick Reply</span>
                 <select 
                    value={replyTargetLanguage}
                    onChange={(e) => {
                      setReplyTargetLanguage(e.target.value);
                      chrome.storage.local.set({ wassupReplyLang: e.target.value });
                    }}
                    style={{ padding: '4px 6px', borderRadius: 6, border: '1px solid #e5e7eb', fontSize: 11, background: '#f9fafb', color: '#111827', outline: 'none', cursor: 'pointer', fontWeight: 600 }}
                 >
                   {ALL_LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                 </select>
              </div>
              <div style={{ padding: 12, background: '#fff' }}>
                 <textarea 
                   placeholder={`Type in ${targetLang}...`}
                   value={replyText}
                   onChange={e => {
                     setReplyText(e.target.value);
                     setReplyTranslatedText("");
                     setReplyCopied(false);
                   }}
                   onKeyDown={(e) => {
                     if (e.key === 'Enter' && !e.shiftKey) {
                       e.preventDefault();
                       handleTranslateReply();
                     }
                   }}
                   style={{ width: '100%', boxSizing: 'border-box', border: 'none', background: 'transparent', resize: 'none', minHeight: 60, outline: 'none', fontSize: 13, color: '#111827', marginBottom: 8, padding: 0 }}
                 />
                 {replyTranslatedText && (
                   <div style={{ padding: '10px 12px', background: '#f0fdf4', borderRadius: 8, marginBottom: 12, border: '1px solid #bbf7d0', animation: 'fadeIn 0.2s ease-out' }}>
                     <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#166534', lineHeight: 1.4 }}>{replyTranslatedText}</p>
                   </div>
                 )}
                 <button 
                   onClick={handleTranslateReply}
                   disabled={isReplying || !replyText.trim()}
                   style={{ width: '100%', padding: '10px', background: replyCopied ? '#10b981' : '#000', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 12, cursor: replyText.trim() ? 'pointer' : 'default', opacity: isReplying ? 0.7 : 1, transition: 'background 0.2s', display: 'flex', justifyContent: 'center', gap: 6, alignItems: 'center' }}
                 >
                   {isReplying ? "Translating..." : replyCopied ? "✓ Translated & Copied!" : "Translate & Copy"}
                 </button>
              </div>
            </div>
            
            {/* Dictionary Section */}
            <div style={{ marginBottom: 20, borderTop: '1px solid #f3f4f6', paddingTop: 20 }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.025em' }}>{strings.personalDict}</h4>
              <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                <input value={newSlang} onChange={e=>setNewSlang(e.target.value)} placeholder={strings.slang} style={{ flex: 1, padding: '8px 10px', borderRadius: 8, border: '2px solid #f3f4f6', fontSize: 13, outline: 'none' }} />
                <input value={newTrans} onChange={e=>setNewTrans(e.target.value)} placeholder={strings.meaning} style={{ flex: 1, padding: '8px 10px', borderRadius: 8, border: '2px solid #f3f4f6', fontSize: 13, outline: 'none' }} />
                <button onClick={addDictWord} style={{ background: '#000', color: '#fff', border: 'none', borderRadius: 8, padding: '0 14px', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>{strings.add}</button>
              </div>
              {Object.keys(customDict).length > 0 && (
                <div style={{ background: '#f9fafb', borderRadius: 10, padding: '4px 12px', maxHeight: 110, overflowY: 'auto', border: '1px solid #f3f4f6' }}>
                  {Object.entries(customDict).map(([local, en]) => (
                    <div key={local} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f3f4f6', fontSize: 13 }}>
                      <span style={{ fontSize: 13 }}><strong style={{color:'#111827'}}>{local}</strong> &rarr; <span style={{color:'#4b5563'}}>{en}</span></span>
                      <button onClick={() => deleteDictWord(local)} style={{background: 'none', border:'none', color: '#9ca3af', cursor:'pointer', fontWeight: 500, fontSize: 18}} title="Remove">×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: 16, textAlign: 'center' }}>
              <button 
                onClick={logout}
                style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: 11, cursor: 'pointer', padding: 0, textDecoration: 'underline', fontWeight: 500 }}
              >
                {strings.logout}
              </button>
            </div>
          </div>
        )}
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
        *:focus-visible { outline: 2px solid #000; outline-offset: 2px; }
      `}</style>
    </div>
  );
}
