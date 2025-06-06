import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import uiTexts from "../components/uiTexts";

const apiKey = "pub_1c9c334c60e445fe8920c1f11cd3b8b1";
const defaultPlaceholderImage = "/assets/default_img.png";

export default function NewsDetailPage() {
    const [language, setLanguage] = useState(
        localStorage.getItem("selectedLanguage") || "hi"
    );
    const [category, setCategory] = useState(
        localStorage.getItem("selectedCategory") || "general"
    );
    const [article, setArticle] = useState(null);
    const [articleLoading, setArticleLoading] = useState(true);
    const [articleError, setArticleError] = useState("");
    const [relatedNews, setRelatedNews] = useState([]);
    const [relatedLoading, setRelatedLoading] = useState(true);

    // Load article from localStorage (simulate deep-link routing)
    useEffect(() => {
        setArticleLoading(true);
        setArticleError("");
        const selectedArticle = localStorage.getItem("selectedArticle");
        if (selectedArticle) {
            try {
                const art = JSON.parse(selectedArticle);
                setArticle(art);
                setArticleLoading(false);
            } catch (e) {
                setArticleError("लेख डेटा को पार्स करने में त्रुटि हुई। कृपया होमपेज पर वापस जाएं।");
                setArticleLoading(false);
            }
        } else {
            setArticleError("कोई लेख चयनित नहीं है। कृपया होमपेज पर वापस जाएं।");
            setArticleLoading(false);
        }
    }, []);

    // Fetch related news when language changes
    useEffect(() => {
        setRelatedLoading(true);
        fetchRelatedNews();
        // eslint-disable-next-line
    }, [language]);

    // Persist language selection
    useEffect(() => {
        localStorage.setItem("selectedLanguage", language);
    }, [language]);

    // Fetch related news articles (just a few for the grid)
    async function fetchRelatedNews() {
        const apiUrl = `https://newsdata.io/api/1/news?apikey=${apiKey}&language=${language}&country=in`;
        try {
            const response = await fetch(apiUrl);
            const data = await response.json();
            const allArticles = data.results || [];
            // Only show articles with a title and a description
            const validArticles = allArticles.filter(
                (a) =>
                    a.title &&
                    a.title.toLowerCase() !== "[removed]" &&
                    a.description &&
                    a.description.trim() !== "" &&
                    a.description.toLowerCase() !== "[removed]"
            );
            setRelatedNews(validArticles.slice(0, 6));
        } catch (err) {
            setRelatedNews([]);
        }
        setRelatedLoading(false);
    }

    function getArticleImage() {
        if (!article) return defaultPlaceholderImage;
        if (article.image_url && article.image_url.trim() !== "") {
            return article.image_url;
        }
        return defaultPlaceholderImage;
    }

    const texts = uiTexts[language] || uiTexts["en"];


    return (
        <>
            <Header
                currentCategory={category}
                onCategoryChange={(cat) => {
                    setCategory(cat);
                    localStorage.setItem("selectedCategory", cat);
                    // Optionally redirect to home here
                    window.location.href = "/";
                }}
                language={language}
                setLanguage={setLanguage}
            />

            <div className="main-container article-page-container">
                <article
                    id="news-article-content"
                    style={{
                        display: articleLoading || articleError ? "none" : undefined,
                    }}
                >
                    {article && (
                        <>
                            <h2 id="article-title">{article.title || "शीर्षक उपलब्ध नहीं है"}</h2>
                            <p className="article-meta">
                                <span id="article-source">{article.source_name || "अज्ञात स्रोत"}</span> |{" "}
                                <span id="article-date">
                                    {article.pubDate &&
                                        new Date(article.pubDate).toLocaleString("en-US", {
                                            day: "numeric",
                                            month: "long",
                                            year: "numeric",
                                        })}
                                </span>
                            </p>
                            <img
                                id="article-image"
                                src={getArticleImage()}
                                alt={article.title || "समाचार छवि"}
                                className={
                                    article.image_url && article.image_url.trim() !== ""
                                        ? "article-full-image thumbnail"
                                        : "article-full-image placeholder-thumbnail"
                                }
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = defaultPlaceholderImage;
                                    e.target.classList.add("placeholder-thumbnail");
                                }}
                                style={{ display: "block" }}
                            />
                            <div id="article-body" className="article-body-content">
                                {/* Render each paragraph for readability */}
                                {(article.description || "इस लेख के लिए विस्तृत सामग्री उपलब्ध नहीं है। कृपया मूल स्रोत पर जाएँ。")
                                    .split("\n")
                                    .filter((p) => p.trim().length > 0)
                                    .map((p, i) => (
                                        <p key={i}>{p}</p>
                                    ))}
                            </div>
                        </>
                    )}
                </article>
                {articleLoading && (
                    <div id="article-loading-indicator" className="loading-indicator">
                        <p>लेख लोड हो रहा है...</p>
                    </div>
                )}
                {articleError && (
                    <div id="article-error-message" className="error-message">
                        <p>{articleError}</p>
                    </div>
                )}
            </div>

            <div className="main-container">
                <section id="related-news-section" style={{ marginTop: 40 }}>
                    <div className="news-grid" id="related-news-grid">
                        {relatedLoading ? (
                            <p style={{ textAlign: "center" }}>संबंधित समाचार लोड हो रहा है...</p>
                        ) : relatedNews.length === 0 ? (
                            <p style={{ textAlign: "center", gridColumn: "1 / -1" }}>
                                संबंधित समाचार उपलब्ध नहीं हैं।
                            </p>
                        ) : (
                            relatedNews.map((news, idx) => (
                                <RelatedNewsCard news={news} key={idx} />
                            ))
                        )}
                    </div>
                </section>
            </div>

            <Footer />
        </>
    );
}

// A related news card component
function RelatedNewsCard({ news }) {
    const defaultPlaceholderImage = "/assets/default_img.png";
    const imgSrc =
        news.image_url && news.image_url.trim() !== ""
            ? news.image_url
            : defaultPlaceholderImage;

    return (
        <div className="news-card" style={{ cursor: "pointer" }}
            onClick={() => {
                localStorage.setItem("selectedArticle", JSON.stringify(news));
                window.location.href = "/news-detail";
            }}>
            <img src={imgSrc} alt={news.title || "News"} className="thumbnail" />
            <div className="news-card-content">
                <h3>{news.title}</h3>
                <p className="description">
                    {(news.description || "").substring(0, 100) + "..."}
                </p>
                <div className="meta">
                    <span>{news.source_name || "Source"}</span>
                    <br />
                    <span>
                        {news.pubDate &&
                            new Date(news.pubDate).toLocaleString("en-US", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                            })}
                    </span>
                </div>
                <button
                    className="read-more-btn"
                    onClick={() => {
                        localStorage.setItem("selectedArticle", JSON.stringify(article));
                        window.location.href = "/news-detail";
                    }}
                >
                    Read More
                </button>
            </div>
        </div>
    );
}