export default function TrustBadge({ score }) {
  const numeric = Number(score || 0);
  const label = numeric >= 0.7 ? "High trust" : numeric >= 0.4 ? "Medium trust" : "Building trust";
  const style =
    numeric >= 0.7
      ? { background: "rgba(0,53,48,0.4)", color: "#69f8e9" }
      : numeric >= 0.4
        ? { background: "rgba(71,35,190,0.25)", color: "#cabeff" }
        : { background: "rgba(34,42,61,0.6)", color: "#c6c5d1" };

  return <span className="pill" style={style}>{label}: {numeric.toFixed(2)}</span>;
}
