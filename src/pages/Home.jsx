import React, { useState, useEffect, useCallback, useRef } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import uiTexts from "../components/uiTexts";

const apiKey = "pub_1c9c334c60e445fe8920c1f11cd3b8b1";
const defaultPlaceholderImage = "/assets/default_img.png";

export default function Home() {
    const [language, setLanguage] = useState(localStorage.getItem("selectedLanguage") || "hi");
    const [category, setCategory] = useState(localStorage.getItem("selectedCategory") || "general");
    const [articles, setArticles] = useState([]);
    const [featured, setFeatured] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [nextPageToken, setNextPageToken] = useState(null);

    // Prevent multiple fetches at once
    const fetchingRef = useRef(false);

    // Fetch news
    const fetchNews = useCallback(
        async (cat, isLoadMore = false, lang = language, pageToken = nextPageToken) => {
            if (fetchingRef.current) return;
            fetchingRef.current = true;
            setLoading(true);
            setError("");
            let apiUrl = `https://newsdata.io/api/1/news?apikey=${apiKey}&language=${lang}`;
            const categoryMap = {
                general: "top",
                world: "world",
                business: "business",
                technology: "technology",
                nation: "politics",
                entertainment: "entertainment",
                sports: "sports",
                science: "science",
                health: "health"
            };
            if (cat !== "general" && categoryMap[cat]) apiUrl += `&category=${categoryMap[cat]}`;
            if (isLoadMore && pageToken) apiUrl += `&page=${pageToken}`;

            try {
                const response = await fetch(apiUrl);
                if (!response.ok) throw new Error("API Error: " + response.statusText);
                const data = await response.json();
                setNextPageToken(data.nextPage || null);

                const validArticles = (data.results || []).filter(article =>
                    article.title &&
                    article.title.toLowerCase() !== "[removed]" &&
                    article.description &&
                    article.description.trim() !== "" &&
                    article.description.toLowerCase() !== "[removed]"
                );

                if (!isLoadMore) {
                    setFeatured(validArticles[0] || null);
                    setArticles(validArticles.slice(1));
                } else {
                    setArticles(prev => [...prev, ...validArticles]);
                }
            } catch (err) {
                setError("Unable to load news: " + err.message);
            }
            setLoading(false);
            fetchingRef.current = false;
        },
        [language, nextPageToken]
    );

    // Fetch news when language or category changes
    useEffect(() => {
        setArticles([]);
        setFeatured(null);
        setNextPageToken(null);
        localStorage.setItem("selectedLanguage", language);
        fetchNews(category, false, language, null);
        // eslint-disable-next-line
    }, [language, category]); // Only run when language/category changes

    // Infinite scroll handler (debounced)
    useEffect(() => {
        let timeout = null;
        function handleScroll() {
            // Only trigger if not loading, have nextPageToken, and near bottom
            if (
                !loading &&
                nextPageToken &&
                window.innerHeight + window.scrollY >= document.body.offsetHeight - 200
            ) {
                if (timeout) clearTimeout(timeout);
                timeout = setTimeout(() => {
                    fetchNews(category, true, language, nextPageToken);
                }, 200);
            }
        }
        window.addEventListener("scroll", handleScroll);
        return () => {
            window.removeEventListener("scroll", handleScroll);
            if (timeout) clearTimeout(timeout);
        };
    }, [loading, nextPageToken, category, language, fetchNews]);

    const texts = uiTexts[language] || uiTexts["en"];

    return (
        <>
            <Header
                currentCategory={category}
                onCategoryChange={cat => {
                    setCategory(cat);
                    localStorage.setItem("selectedCategory", cat);
                }}
                language={language}
                setLanguage={setLanguage}
            />
            <main>
                <div className="main-container">
                    <h2>{/* category title */}</h2>
                    <div id="featured-article-placeholder">
                        {featured && <NewsCard article={featured} featured />}
                    </div>
                    <div className="news-grid">
                        {articles.map((article, i) => (
                            <NewsCard key={i} article={article} />
                        ))}
                    </div>
                    {loading && <div className="loading-indicator"><p>{texts.loading}</p></div>}
                    {error && <div className="error-message"><p>{texts.error}</p></div>}
                </div>
            </main>
            <Footer />
        </>
    );
}

function NewsCard({ article, featured }) {
    const imgSrc =
        article.image_url && article.image_url.trim() !== ""
            ? article.image_url
            : defaultPlaceholderImage;
    return (
        <div className={"news-card" + (featured ? " featured-article" : "")}>
            <img src={imgSrc} alt={article.title || "News"} className="thumbnail" />
            <div className="news-card-content">
                <h3>{article.title}</h3>
                <p className="description">
                    {article.description.substring(0, featured ? 200 : 100) + "..."}
                </p>
                <div className="meta">
                    <span>{article.source_name || "Source"}</span>
                    <br />
                    <span>
                        {article.pubDate && new Date(article.pubDate).toLocaleString("en-US", {
                            day: "numeric",
                            month: "long",
                            year: "numeric"
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