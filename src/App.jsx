import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import NewsDetailPage from "./pages/NewsDetailPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/news-detail" element={<NewsDetailPage />} />
      </Routes>
    </Router>
  );
}

export default App;