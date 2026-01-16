import { useSystemStore } from "../../store/systemStore";

export function BackButton() {
  const goBack = useSystemStore((s) => s.goBack);

  return (
    <button
      onClick={goBack}
      className="btn-back"
      aria-label="Go back to dashboard"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 4l-6 6 6 6" />
      </svg>
    </button>
  );
}
