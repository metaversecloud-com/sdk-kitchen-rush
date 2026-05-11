import { PageContainer } from "./PageContainer";
import { levelConfig } from "@/config/levelConfig";

interface LevelIntermissionProps {
  level: number;
  carry: { score: number; angry: number };
  onContinue: () => void;
}

export const LevelIntermission = ({ level, carry, onContinue }: LevelIntermissionProps) => {
  const config = levelConfig[level as keyof typeof levelConfig];

  if (!config) {
    return (
      <PageContainer isLoading={false} headerText="Level Not Found">
        <p className="p2">No configuration found for level {level}.</p>
      </PageContainer>
    );
  }

  return (
    <PageContainer isLoading={false}>
      <div className="grid gap-4">
        <span className="chip-primary">Level {level}</span>
        <h2>{config.title}</h2>

        <p>{config.description}</p>
        <p className="stats-preview">
          Score: <strong>{carry.score}</strong> | Angry: <strong>{carry.angry}/5</strong>
        </p>

        <div className="card">
          <h4>New This Level:</h4>
          <ul className="m-1 pl-5">{config.instructions?.map((item, i) => <li key={i}>{item}</li>)}</ul>
        </div>

        <button className="btn btn-primary" onClick={onContinue}>
          Start Brewing
        </button>
      </div>
    </PageContainer>
  );
};

export default LevelIntermission;
