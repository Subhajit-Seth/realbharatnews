import React, { useEffect, useRef, useState } from "react";

const languages = [
    { lang: "hi", name: "हिन्दी" },
    { lang: "en", name: "English" },
    { lang: "bn", name: "বাংলা" },
    // { lang: "ta", name: "தமிழ்" },
    { lang: "te", name: "తెలుగు" },
    // { lang: "ml", name: "മലയാളം" },
    { lang: "kn", name: "ಕನ್ನಡ" },
    { lang: "gu", name: "ગુજરાતી" },
    { lang: "mr", name: "मराठी" },
    { lang: "pa", name: "ਪੰਜਾਬੀ" },
    { lang: "ur", name: "اردو" },
    { lang: "or", name: "ଓଡ଼ିଆ" }
];

export default function LanguageSelector({ language, setLanguage }) {
    const [dropdown, setDropdown] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        function handleClickOutside(e) {
            if (ref.current && !ref.current.contains(e.target)) setDropdown(false);
        }
        if (dropdown) document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdown]);

    return (
        <div className="language-selector" ref={ref}>
            <button
                className={`language-dropdown${dropdown ? " active" : ""}`}
                aria-label="Select Language"
                aria-expanded={dropdown}
                type="button"
                onClick={() => setDropdown(d => !d)}
            >
                <span>
                    {languages.find(l => l.lang === language)?.name || "हिन्दी"}
                </span>
            </button>
            <div className={`language-options${dropdown ? " show" : ""}`}>
                {languages.map(opt => (
                    <div
                        key={opt.lang}
                        className={`language-option${language === opt.lang ? " selected" : ""}`}
                        data-lang={opt.lang}
                        data-name={opt.name}
                        onClick={() => {
                            setLanguage(opt.lang);
                            setDropdown(false);
                            localStorage.setItem("selectedLanguage", opt.lang);
                        }}
                    >
                        {opt.name}
                    </div>
                ))}
            </div>
        </div>
    );
}