import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { levelConfig } from "../config/levelConfig";
import PageContainer from "./PageContainer";
import "../styles/LevelIntermission.css";

const LevelIntermission = () => {
  const navigate = useNavigate();
  const { levelId } = useParams();
  
  // Find the specific config for this level
  const config = levelConfig[Number(levelId) as keyof typeof levelConfig];

  if (!config) return <div>Level configuration not found.</div>;

  return (
    <PageContainer isLoading={false}>
      <div className="intermission-wrapper">
        <div className="level-card">
          <span className="level-badge">Level {levelId}</span>
          <h1 className="level-title">{config.title}</h1>
          
          <div className="description-box">
            <p>{config.description}</p>
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
            onClick={() => navigate(`/game/${levelId}`)}
          >
            START BREWING
          </button>
        </div>
      </div>
    </PageContainer>
  );
};

export default LevelIntermission;