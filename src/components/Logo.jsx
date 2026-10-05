export default function Logo({ height = 52, width = 100 }) {
  return (
    <div style={{ height, display: "flex", alignItems: "center" }}>
      <img
        className="du-logo-light"
        src="/assets/aitu-logo.svg"
        alt="Astana IT University"
        style={{ width, height: "auto" }}
      />
      <img
        className="du-logo-dark"
        src="/assets/aitu-logo-dark.svg"
        alt="Astana IT University"
        style={{ width, height: "auto" }}
      />
    </div>
  );
}
