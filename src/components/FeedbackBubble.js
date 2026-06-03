import React from "react";
import "../styles/feedbackBubble.scss";

const PersonIcon = ({ size = 18, color = "#fff" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="8" r="4" fill={color} />
    <path d="M4 20c0-4.418 3.582-8 8-8s8 3.582 8 8" fill={color} />
  </svg>
);

const FeedbackBubble = ({
  text = "Sample",
  icon,
  bubbleColor = "#fff",
  borderColor = "var(--color-green)",
  avatarBg = "var(--color-green)",
  textColor = "var(--color-text)",
  compact = false,
  style,
  className = "",
  value,
  onChange,
  placeholder,
  rows = 2,
  readOnly = false,
  onBlur,
}) => {
  const isEditable = Boolean(onChange) && !readOnly;
  const resolvedText = typeof value === "string" ? value : text;

  const [internalValue, setInternalValue] = React.useState(resolvedText);

  React.useEffect(() => {
    setInternalValue(resolvedText);
  }, [resolvedText]);

  const textareaRef = React.useRef(null);

  // Auto-resize textarea to fit content
  const autoResize = React.useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, []);

  React.useEffect(() => {
    autoResize();
  }, [internalValue, autoResize]);

  const handleBlur = () => {
    if (onBlur) {
      onBlur(internalValue);
    }
  };

  return (
    <div
      className={`fb-row ${
        compact ? "fb-row--compact" : ""
      } ${className}`.trim()}
      style={style}
    >
      <div className="fb-avatar-wrap">
        {icon}
      </div>
      <div
        className="fb-bubble"
        style={{
          "--fb-bubble-bg": bubbleColor,
          "--fb-text-color": textColor,
          "--fb-border": borderColor,
        }}
      >
        {isEditable ? (
          <textarea
            ref={textareaRef}
            className="fb-textarea"
            value={internalValue}
            onChange={(e) => { setInternalValue(e.target.value); autoResize(); }}
            onBlur={handleBlur}
            placeholder={placeholder}
            readOnly={readOnly}
          />
        ) : (
          <div className="fb-text">{resolvedText}</div>
        )}
        <div className="fb-bubble-thread"></div>
      </div>
    </div>
  );
};
export default FeedbackBubble;

// import React from "react";
// import "../styles/feedbackBubble.scss";

// const PersonIcon = ({ size = 18, color = "#fff" }) => (
//   <svg
//     width={size}
//     height={size}
//     viewBox="0 0 24 24"
//     fill="none"
//     xmlns="http://www.w3.org/2000/svg"
//   >
//     <circle cx="12" cy="8" r="4" fill={color} />
//     <path d="M4 20c0-4.418 3.582-8 8-8s8 3.582 8 8" fill={color} />
//   </svg>
// );

// const FeedbackBubble = ({
//   text = "Sample",
//   icon,
//   bubbleColor = "#fff",
//   borderColor = "#1a5f4a",
//   avatarBg = "#1a5f4a",
//   textColor = "#000",
//   compact = false,
//   style,
//   className = "",
//   value,
//   onChange,
//   placeholder,
//   rows = 2,
//   readOnly = false,
// }) => {
//   return (
//     <div
//       className={`fb-row ${
//         compact ? "fb-row--compact" : ""
//       } ${className}`.trim()}
//       style={style}
//     >
//       <div className="fb-avatar-wrap">
//         <div
//           className="fb-avatar"
//           style={{
//             "--fb-avatar-bg": avatarBg,
//             "--fb-border": borderColor
//           }}
//         >
//           {icon || <img src="/home/wizgeeks/Code/intellect/src/assets/png/greenPersonIcon.png" alt="Green Person Icon" style={{ width: '20px', height: '20px' }} />}
//         </div>
//       </div>

//       <div className="fb-bubble-wrapper" style={{ "--fb-border": borderColor }}>
//         <svg
//           className="fb-tail"
//           width="24"
//           height="56"
//           viewBox="0 0 24 56"
//           preserveAspectRatio="none"
//           style={{ "--fb-border": borderColor }}
//         >
//           <path
//             d="M 24 0 Q 10 10, 8 28 Q 10 45, 24 56"
//             fill="none"
//             stroke={borderColor}
//             strokeWidth="2"
//             strokeLinecap="round"
//             strokeLinejoin="round"
//           />
//         </svg>

//         <div
//           className="fb-bubble"
//           style={{
//             "--fb-bubble-bg": bubbleColor,
//             "--fb-text-color": textColor,
//             "--fb-border": borderColor,
//           }}
//         >
//           <textarea
//             className="fb-textarea"
//             value={typeof value === "string" ? value : undefined}
//             onChange={onChange}
//             defaultValue={typeof value === "string" ? undefined : text}
//             placeholder={placeholder}
//             rows={rows}
//             readOnly={readOnly || !onChange}
//           />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default FeedbackBubble;
