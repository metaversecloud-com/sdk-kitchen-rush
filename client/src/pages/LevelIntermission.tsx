import React from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom"; // Added useLocation
import { levelConfig } from "../config/levelConfig";
import { PageContainer } from "../components";
import "../styles/LevelIntermission.css";

const LevelIntermission = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Initialize location to grab the state
  const { levelId } = useParams();
  
  // 1. CATCH the data from the previous level
  const inheritedScore = location.state?.inheritedScore || 0;
  const inheritedAngry = location.state?.inheritedAngry || 0;

  const config = levelConfig[Number(levelId) as keyof typeof levelConfig];

  if (!config) return <div>Level configuration not found.</div>;

  const handleStartBrewing = () => {
    // 2. PASS the data forward to the Game component
    navigate(`/game/${levelId}`, {
      state: {
        inheritedScore: inheritedScore,
        inheritedAngry: inheritedAngry
      }
    });
  };

  return (
    <PageContainer isLoading={false}>
      <div className="intermission-wrapper">
        <div className="level-card">
          <span className="level-badge">Level {levelId}</span>
          <h1 className="level-title">{config.title}</h1>
          
          <div className="description-box">
            <p>{config.description}</p>
            {/* Optional: Show the player their current standing */}
            <p className="stats-preview">
              Current Score: <strong>{inheritedScore}</strong> | 
              Angry Faces: <strong>{inheritedAngry}/5</strong>
            </p>
          </div>

          <div className="instructions-section">
            <h3>New This Level:</h3>
            <ul>
              {config.instructions?.map((item: string, i: number) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>

          <button 
            className="start-button" 
            onClick={handleStartBrewing} // Use the new handler
          >
            START BREWING
          </button>
        </div>
      </div>
    </PageContainer>
  );
};

export default LevelIntermission;