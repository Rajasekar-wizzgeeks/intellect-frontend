import React from "react";

const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "rgba(255,255,255,0.7)",
  zIndex: 13000,
};

const spinnerStyle = {
  width: 48,
  height: 48,
  border: "4px solid #e0e0e0",
  borderTop: "4px solid var(--color-primary, #1976d2)",
  borderRadius: "50%",
  animation: "globalLoaderSpin 1s linear infinite",
};

const textStyle = {
  marginTop: 12,
  color: "#555",
  fontWeight: 500,
  textAlign: "center",
};

const ensureKeyframes = () => {
  if (document.getElementById("global-loader-keyframes")) return;
  const style = document.createElement("style");
  style.id = "global-loader-keyframes";
  style.innerHTML = `@keyframes globalLoaderSpin { from { transform: rotate(0deg);} to { transform: rotate(360deg);} }`;
  document.head.appendChild(style);
};

const GlobalLoader = ({ visible = false, text = "Loading..." }) => {
  if (!visible) return null;
  if (typeof window !== "undefined") ensureKeyframes();
  return (
    <div style={overlayStyle} role="status" aria-live="polite">
      <div>
        <div style={spinnerStyle} />
      </div>
    </div>
  );
};

export default GlobalLoader;
