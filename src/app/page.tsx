"use client";
import { useState } from "react";
import { AvatarStudio } from "@/components/AvatarStudio";
import VectorizeForm from "@/components/VectorizeForm";
import ClusterForm from "@/components/ClusterForm";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { LanguageSwitcher } from "@/i18n/I18nProvider";

const tabs = [
  { id: "avatar", label: "Avatar Studio" },
  { id: "vectorize", label: "Vectorize" },
  { id: "cluster", label: "Cluster" },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>("avatar");

  return (
    <div className="home">
      <nav className="home__nav">
        <div className="home__brand">
          <span>Magister Thesis Visual Toolkit</span>
        </div>
        <div className="home__tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`home__tab ${activeTab === tab.id ? "home__tab--active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="home__actions">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </nav>

      <main className="home__content">
        {activeTab === "avatar" && <AvatarStudio />}
        {activeTab === "vectorize" && <VectorizeForm />}
        {activeTab === "cluster" && <ClusterForm />}
      </main>
    </div>
  );
}
