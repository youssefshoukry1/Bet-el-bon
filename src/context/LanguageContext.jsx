"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { translations } from "../components/i18n/translations";

const LanguageContext = createContext(undefined);

export function LanguageProvider({ children }) {
    // Default to English initially to avoid hydration mismatch
    const [language, setLanguage] = useState("en");
    const [isClient, setIsClient] = useState(false);

    // Detect direction based on language
    const getDirection = (lang) => {
        return lang === "ar" ? "rtl" : "ltr";
    };

    // Load saved language on mount
    useEffect(() => {
        setIsClient(true);
        const savedLang = localStorage.getItem("app-language");
        if (savedLang && ["en", "ar"].includes(savedLang)) {
            setLanguage(savedLang);
            updateDOM(savedLang);
        } else {
            // Default to English
            updateDOM("en");
        }
    }, []);

    const updateDOM = (lang) => {
        const dir = getDirection(lang);
        document.documentElement.dir = dir;
        document.documentElement.lang = lang;
        document.body.dir = dir;
        // Update body class for Tailwind RTL support if needed
        if (dir === "rtl") {
            document.documentElement.classList.add("rtl");
        } else {
            document.documentElement.classList.remove("rtl");
        }
    };

    const handleSetLanguage = (lang) => {
        if (["en", "ar"].includes(lang)) {
            setLanguage(lang);
            localStorage.setItem("app-language", lang);
            updateDOM(lang);
        }
    };

    // Translation function with support for variable interpolation
    const t = (key, variables = {}) => {
        // Get translation from current language or fallback to English
        let translatedText =
            translations[language]?.[key] || translations["en"]?.[key] || key;

        // Replace variables in format {variableName}
        if (variables && Object.keys(variables).length > 0) {
            Object.entries(variables).forEach(([varKey, varValue]) => {
                translatedText = translatedText.replace(
                    new RegExp(`{${varKey}}`, "g"),
                    varValue
                );
            });
        }

        return translatedText;
    };

    const direction = getDirection(language);

    const value = {
        language,
        setLanguage: handleSetLanguage,
        t,
        dir: direction,
        isRTL: direction === "rtl",
        isClient,
    };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
}

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
};
