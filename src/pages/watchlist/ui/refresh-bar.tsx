import {
  APP_TITLE,
  BUTTON_ADD,
  BUTTON_REFRESH,
  BUTTON_STOP,
  SCREEN_REFRESHING,
} from "@/shared/config";

type RefreshBarProps = {
  status: string;
  error: string | null;
  onRefresh: () => void;
  onStop: () => void;
};

const RefreshBar = ({ status, error, onRefresh, onStop }: RefreshBarProps) => {
  const refreshing = status === SCREEN_REFRESHING;
  return (
    <header className="refresh-bar">
      <div className="refresh-bar-title">
        <h1>{APP_TITLE}</h1>
        {error ? <p className="refresh-error">{error}</p> : null}
      </div>
      <div className="refresh-actions">
        <button type="button" disabled>
          {BUTTON_ADD}
        </button>
        <button type="button" onClick={onRefresh} disabled={refreshing}>
          {BUTTON_REFRESH}
        </button>
        <button type="button" onClick={onStop} disabled={!refreshing}>
          {BUTTON_STOP}
        </button>
      </div>
    </header>
  );
};

export default RefreshBar;
