import React, { useState } from "react";
import logo from "../assets/images/logo.png";
import LanguageSelector from "./LanguageSelector";
import uiTexts from "./uiTexts";

const categories = [
    { key: "general" },
    { key: "world" },
    { key: "business" },
    { key: "technology" },
    { key: "entertainment" },
    { key: "sports" },
    { key: "science" },
    { key: "health" }
];

export default function Header({
    currentCategory,
    onCategoryChange,
    language,
    setLanguage
}) {
    const [menuOpen, setMenuOpen] = useState(false);
    const texts = uiTexts[language] || uiTexts["en"];
    return (
        <header>
            <div className="container header-container">
                <a href="/" className="link">
                    <h1>
                        <img className="nav-logo" src={logo} alt="Real Bharat News" />
                    </h1>
                </a>
                <div className="header-right">
                    <button
                        className={`hamburger${menuOpen ? " open" : ""}`}
                        aria-label="Toggle menu"
                        aria-expanded={menuOpen}
                        onClick={e => {
                            e.stopPropagation();
                            setMenuOpen(open => !open);
                        }}
                        type="button"
                    >
                        <i className="fa-solid fa-bars" style={{ fontSize: "1.7rem" }}></i>
                    </button>
                </div>
                <nav id="nav-menu" style={menuOpen ? { display: "block" } : {}}>
                    <ul>
                        {categories.map(cat => (
                            <li key={cat.key}>
                                <a
                                    href="#"
                                    className={`category-link${currentCategory === cat.key ? " active" : ""}`}
                                    data-category={cat.key}
                                    onClick={e => {
                                        e.preventDefault();
                                        onCategoryChange && onCategoryChange(cat.key);
                                        setMenuOpen(false);
                                    }}
                                >
                                    {texts.navbar[cat.key]}
                                </a>
                            </li>
                        ))}
                        <li>
                            <LanguageSelector language={language} setLanguage={setLanguage} />
                        </li>
                    </ul>
                </nav>
            </div>
        </header>
    );
}