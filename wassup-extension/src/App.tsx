import { useState, useEffect } from 'react';

const LANGUAGE_GREETINGS: Record<string, string> = {
  English: 'Hello, Ready to decode!',
  Spanish: '¡Hola, listo para decodificar!',
  French: 'Bonjour, prêt à décoder !',
  German: 'Hallo, bereit zum Entschlüsseln!',
  Portuguese: 'Olá, pronto para decodificar!',
  Italian: 'Ciao, pronto a decodificare!'
};

const BROWSER_LANG_MAP: Record<string, string> = {
  'en': 'English', 'es': 'Spanish', 'fr': 'French',
  'de': 'German', 'pt': 'Portuguese', 'it': 'Italian'
};

export default function App() {
  const [licenseKey, setLicenseKey] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [targetLang, setTargetLang] = useState("English");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    chrome.storage.local.get(["wassupProKey", "wassupTargetLanguage"], (res) => {
      if (res.wassupProKey) {
        setIsActive(true);
        setLicenseKey(res.wassupProKey);
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

  const saveKey = () => {
    if (!licenseKey.trim()) return;
    chrome.storage.local.set({ wassupProKey: licenseKey }, () => {
      setIsActive(true);
    });
  };
  
  const saveLang = (lang: string) => {
    setTargetLang(lang);
    chrome.storage.local.set({ wassupTargetLanguage: lang });
  };
  
  const logout = () => {
    if (confirm("Are you sure you want to deactivate this device?")) {
      chrome.storage.local.remove("wassupProKey", () => {
        setIsActive(false);
        setLicenseKey("");
      });
    }
  };

  const greeting = LANGUAGE_GREETINGS[targetLang] || LANGUAGE_GREETINGS.English;

  if (isLoading) return <div style={{width: 320, padding: 20}}>Loading...</div>;

  return (
    <div style={{ padding: 20, width: 320, fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontSize: 18, margin: 0, fontWeight: 700 }}>Wassup Decoder</h2>
        <span style={{ marginLeft: 'auto', background: '#ff0055', color: '#fff', padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 'bold' }}>PRO</span>
      </div>

      {!isActive ? (
        <div>
          <p style={{ fontSize: 14, color: '#4b5563', marginBottom: 16 }}>
            Enter your Ko-fi Supporter Email to unlock premium real-time translation tools.
          </p>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Ko-fi Supporter Email</label>
            <input 
              type="password" 
              value={licenseKey}
              onChange={(e) => setLicenseKey(e.target.value)}
              placeholder="youremail@example.com"
              style={{ width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14 }}
            />
          </div>

          <button 
            onClick={saveKey}
            style={{ width: '100%', padding: '12px', background: '#000', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}
          >
            Activate Subscription
          </button>
        </div>
      ) : (
        <div>
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: 16, marginBottom: 20 }}>
            <h3 style={{ margin: '0 0 6px 0', fontSize: 16, color: '#166534' }}>{greeting}</h3>
            <p style={{ margin: 0, fontSize: 13, color: '#15803d', lineHeight: '1.4' }}>
              Your pro features are active! The auto-injector is currently standing by to watch your streams.
            </p>
          </div>
          
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8, color: '#374151' }}>
              Translate all chat into:
            </label>
            <select 
              value={targetLang}
              onChange={(e) => saveLang(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14, background: '#fff' }}
            >
              <option value="English">🇬🇧 English</option>
              <option value="Spanish">🇪🇸 Spanish (Español)</option>
              <option value="French">🇫🇷 French (Français)</option>
              <option value="German">🇩🇪 German (Deutsch)</option>
              <option value="Portuguese">🇧🇷 Portuguese (Português)</option>
              <option value="Italian">🇮🇹 Italian (Italiano)</option>
            </select>
            <p style={{ margin: '6px 0 0 0', fontSize: 11, color: '#6b7280' }}>Updates apply to new messages immediately.</p>
          </div>
          
          <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 16, marginTop: 16 }}>
            <button 
              onClick={logout}
              style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: 13, cursor: 'pointer', padding: 0, textDecoration: 'underline' }}
            >
              Deactivate License
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
