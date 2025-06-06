import React, { useState, useEffect, useCallback, useRef } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import uiTexts from "../components/uiTexts";

const apiKey = "pub_25c61abc4c3942adaca1e3c8f6aa464b";
// const apiKeys = [
//     "pub_1c9c334c60e445fe8920c1f11cd3b8b1", //Subhajitseth1998
//     "pub_25c61abc4c3942adaca1e3c8f6aa464b", //Rupamdas
//     "pub_b7989635611b4b14921521cfd48c2491", //Ratan tata
//     "pub_3e0f969a37da414487380f7018d14e0e", //Subhajitseth1013
//     "pub_95188438c86a4a549cd3ed3a53bd827e", //Neelsaha
//     "pub_2c53b174df504374a0b54985ff172abf", //Randeepthakur
//     "pub_661a3801d3b44992902a4bd0f8e93973", //tan
//     "pub_2f7d444c407e4e82b604bc104e4f4539", //doggycanbyte
//     "pub_0f246d8c85884edf97d093a2cb40010a", //tempname
//   ];
const defaultPlaceholderImage = "/assets/default_img.png";

export default function Home() {
    const [language, setLanguage] = useState(localStorage.getItem("selectedLanguage") || "hi");
    const [category, setCategory] = useState(localStorage.getItem("selectedCategory") || "general");
    const [articles, setArticles] = useState([]);
    const [featured, setFeatured] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [nextPageToken, setNextPageToken] = useState(null);
    const [apiKeyIndex, setApiKeyIndex] = useState(0);

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
        language, nextPageToken, apiKeyIndex
    );

    // const fetchNews = useCallback(
    //     async (cat, isLoadMore = false, lang = language, pageToken = nextPageToken, attempt = 0) => {
    //         if (fetchingRef.current) return;
    //         fetchingRef.current = true;
    //         setLoading(true);
    //         setError("");

    //         let currentKey = apiKeys[apiKeyIndex];
    //         let apiUrl = `https://newsdata.io/api/1/news?apikey=${currentKey}&language=${lang}`;
    //         const categoryMap = {
    //             general: "top",
    //             world: "world",
    //             business: "business",
    //             technology: "technology",
    //             nation: "politics",
    //             entertainment: "entertainment",
    //             sports: "sports",
    //             science: "science",
    //             health: "health"
    //         };
    //         if (cat !== "general" && categoryMap[cat]) apiUrl += `&category=${categoryMap[cat]}`;
    //         if (isLoadMore && pageToken) apiUrl += `&page=${pageToken}`;

    //         try {
    //             const response = await fetch(apiUrl);
    //             const data = await response.json();

    //             // Check for API key error or quota limit
    //             if (
    //                 !response.ok ||
    //                 data.status === "error" ||
    //                 data.message?.toLowerCase().includes("api key") ||
    //                 data.message?.toLowerCase().includes("quota")
    //             ) {
    //                 // Try next API key if available and not already tried all
    //                 if (attempt < apiKeys.length - 1) {
    //                     setApiKeyIndex((prev) => (prev + 1) % apiKeys.length);
    //                     await fetchNews(cat, isLoadMore, lang, pageToken, attempt + 1);
    //                     return;
    //                 } else {
    //                     throw new Error(data.message || "API Error: " + response.statusText);
    //                 }
    //             }

    //             setNextPageToken(data.nextPage || null);

    //             const validArticles = (data.results || []).filter(article =>
    //                 article.title &&
    //                 article.title.toLowerCase() !== "[removed]" &&
    //                 article.description &&
    //                 article.description.trim() !== "" &&
    //                 article.description.toLowerCase() !== "[removed]"
    //             );

    //             if (!isLoadMore) {
    //                 setFeatured(validArticles[0] || null);
    //                 setArticles(validArticles.slice(1));
    //             } else {
    //                 setArticles(prev => [...prev, ...validArticles]);
    //             }
    //         } catch (err) {
    //             setError("Unable to load news: " + err.message);
    //         }
    //         setLoading(false);
    //         fetchingRef.current = false;
    //     },
    //     [language, nextPageToken, apiKeyIndex]
    // );

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