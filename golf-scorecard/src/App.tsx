import { Capacitor } from "@capacitor/core";
import { BrowserRouter, Routes, Route, useNavigate, useParams } from "react-router-dom";
import { RoundScreen } from "./screens/ScoreCard";
import { RoundsListScreen } from "./screens/RoundsListScreen";
import { CreateRoundScreen } from "./screens/CreateRoundScreen";
import React from "react";

// Web routing components
function WebRoundsList() {
    const navigate = useNavigate();
    return (
        <RoundsListScreen
            onSelectRound={(id) => navigate(`/round/${id}`)}
            onCreateRound={() => navigate("/create")}
        />
    );
}

function WebCreateRound() {
    const navigate = useNavigate();
    return (
        <CreateRoundScreen
            onRoundCreated={(id) => navigate(`/round/${id}`)}
            onCancel={() => navigate("/")}
        />
    );
}

function WebRoundView() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    if (!id) return null;
    return <RoundScreen roundId={id} onBack={() => navigate("/")} />;
}

function WebApp() {
    // For GitHub Pages, use the /golf-card/ base path
    const basename = process.env.GITHUB_PAGES ? "/golf-card/" : "/";
    return (
        <BrowserRouter basename={basename}>
            <Routes>
                <Route path="/" element={<WebRoundsList />} />
                <Route path="/create" element={<WebCreateRound />} />
                <Route path="/round/:id" element={<WebRoundView />} />
            </Routes>
        </BrowserRouter>
    );
}

// Native state-based navigation
type Screen = { name: "list" } | { name: "create" } | { name: "round"; roundId: string };

function NativeApp() {
    const [screen, setScreen] = React.useState<Screen>({ name: "list" });

    if (screen.name === "list") {
        return (
            <RoundsListScreen
                onSelectRound={(id) => setScreen({ name: "round", roundId: id })}
                onCreateRound={() => setScreen({ name: "create" })}
            />
        );
    }

    if (screen.name === "create") {
        return (
            <CreateRoundScreen
                onRoundCreated={(id) => setScreen({ name: "round", roundId: id })}
                onCancel={() => setScreen({ name: "list" })}
            />
        );
    }

    if (screen.name === "round") {
        return (
            <RoundScreen
                roundId={screen.roundId}
                onBack={() => setScreen({ name: "list" })}
            />
        );
    }

    return null;
}

export default function App() {
    const platform = Capacitor.getPlatform();

    if (platform === "web") {
        return <WebApp />;
    }

    return <NativeApp />;
}
