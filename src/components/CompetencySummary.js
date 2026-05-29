import React, { useEffect, useMemo, useState } from "react";
import AutoPaginatedSections from "./AutoPaginatedSections";
import Header from "./header";
import QuartilePositionCard from "./QuartilePositionCard";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip } from "chart.js";
import "../styles/mainPage.scss";
import "../styles/contentPage.scss";
import "../styles/competencySummary.scss";

ChartJS.register(ArcElement, Tooltip);

const Gauge = ({ score = 370, max = 500 }) => {
  const [currentScore, setCurrentScore] = useState(score);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(String(score));

  const value = Number(currentScore) || 0;
  const total = Number(max) || 500;
  const percentage = Math.max(0, Math.min(100, (value / total) * 100));

  const emptyDoughnut = {
    id: "emptyDoughnut",
    color: "#0B2D16",
    width: 1.5,
    radiusDecrease: 0,
    afterDraw(chart) {
      const meta = chart.getDatasetMeta(0).data[0];
      if (!meta) return;

      const ctx = chart.ctx;
      const centerX = meta.x;
      const centerY = meta.y;

      const radius = meta.outerRadius - this.radiusDecrease - 6;

      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.strokeStyle = this.color;
      ctx.lineWidth = this.width;
      ctx.stroke();
      ctx.restore();
    },
  };

  const handleDoubleClick = () => {
    setEditValue(String(currentScore));
    setIsEditing(true);
  };

  const handleInputChange = (e) => {
    setEditValue(e.target.value);
  };

  const commitEdit = () => {
    const parsed = Number(editValue);
    if (Number.isFinite(parsed)) {
      setCurrentScore(parsed);
    }
    setIsEditing(false);
  };

  const handleInputBlur = () => {
    commitEdit();
  };

  const handleInputKeyDown = (e) => {
    if (e.key === "Enter") {
      commitEdit();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setEditValue(String(currentScore));
    }
  };

  const data = {
    datasets: [
      // Outer thick arc
      {
        data: [percentage, 100 - percentage],
        backgroundColor: ["#0B2D16", "transparent"],
        borderWidth: 0,
        cutout: "73%",
        rotation: 0,
      },

      // Inner thin ring
      {
        data: [percentage, 100 - percentage],
        backgroundColor: ["#0B2D16", "transparent"],
        borderWidth: 0,
        cutout: "50%",
        radius: "74%",
        rotation: 0,
        // circumference: 300,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    // devicePixelRatio: Math.min(window.devicePixelRatio || 2, 2),
    plugins: {
      tooltip: { enabled: false },
      legend: { display: false },
    },
  };
  const centerText = {
    id: "centerText",
    afterDatasetsDraw(chart) {
      const {
        ctx,
        chartArea: { top, width, height },
      } = chart;

      const centerX = width / 2;
      const centerY = height / 2 + top;

      ctx.save();

      const radius = Math.min(width, height) * 0.22;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fillStyle = "#2E8543";
      ctx.fill();

      ctx.font = "500 28px sans-serif";
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(value, centerX, centerY);

      ctx.restore();
    },
  };

  const dottedTicks = {
    id: "dottedTicks",
    afterDraw(chart) {
      const ctx = chart.ctx;
      const meta = chart.getDatasetMeta(0).data[0];

      if (!meta) return;

      const centerX = meta.x;
      const centerY = meta.y;
      const outerRadius = meta.outerRadius - 28;
      const innerRadius = outerRadius - 10;

      ctx.save();
      ctx.strokeStyle = "#0B2D16";
      ctx.lineWidth = 4;
      ctx.lineCap = "round";

      const totalDots = 30;
      const dataset = chart.data?.datasets?.[0];
      const filledPortion = Array.isArray(dataset?.data)
        ? Number(dataset.data[0]) || 0
        : 0;
      const clampedPortion = Math.max(0, Math.min(100, filledPortion));
      const filledDots = Math.round((clampedPortion / 100) * totalDots);
      const startAngle = (-90 * Math.PI) / 180;
      const endAngle = startAngle + (360 * Math.PI) / 180;

      for (let i = 0; i < filledDots; i += 1) {
        const angle = startAngle + (i / totalDots) * (endAngle - startAngle);

        const x1 = centerX + innerRadius * Math.cos(angle);
        const y1 = centerY + innerRadius * Math.sin(angle);

        const x2 = centerX + outerRadius * Math.cos(angle);
        const y2 = centerY + outerRadius * Math.sin(angle);

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }

      ctx.restore();
    },
  };

  return (
    <div className="cs-gauge-chart">
      <div className="cs-gauge-chart__canvas-wrap">
        <Doughnut
          data={data}
          options={options}
          plugins={[dottedTicks, centerText, emptyDoughnut]}
        />
      </div>
      {/* <div className="cs-gauge-chart__value" onDoubleClick={handleDoubleClick}>
        {isEditing ? (
          <input
            type="text"
            value={editValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onKeyDown={handleInputKeyDown}
            autoFocus
            className="cs-gauge-chart__value-input"
          />
        ) : (
          <span>{value}</span>
        )}
      </div> */}
    </div>
  );
};

const CompetencySummary = ({
  startPage = 12,
  pageWidth = 794,
  pageHeight = 842,
  pagePadding = 10,
  cohortQuartiles,
  streamQuartiles,
  cohortInitialSelected = 2,
  streamInitialSelected = 2,
  overallScore = 370,
}) => {
  const defaultCohortMap = useMemo(
    () => ({
      1: ["250.0", "340.0", "370.0", "400.0", "480.0"],
      2: ["283.0", "365.5", "393.5", "425.5", "483.0"],
      3: ["310.0", "380.0", "405.0", "440.0", "490.0"],
      4: ["335.0", "395.0", "415.0", "455.0", "500.0"],
    }),
    [],
  );
  const defaultStreamMap = useMemo(
    () => ({
      1: ["245.0", "338.0", "368.0", "398.0", "478.0"],
      2: ["283.0", "365.5", "393.5", "425.5", "483.0"],
      3: ["305.0", "378.0", "402.0", "438.0", "488.0"],
      4: ["330.0", "392.0", "412.0", "452.0", "498.0"],
    }),
    [],
  );

  const [cohortMap, setCohortMap] = useState(() => cohortQuartiles ?? defaultCohortMap);
  const [streamMap, setStreamMap] = useState(() => streamQuartiles ?? defaultStreamMap);

  useEffect(() => {
    setCohortMap(cohortQuartiles ?? defaultCohortMap);
  }, [cohortQuartiles]);
  useEffect(() => {
    setStreamMap(streamQuartiles ?? defaultStreamMap);
  }, [streamQuartiles]); 

  const quartileHeaders = [
    "Minimum Score",
    "First Quartile (25th percentile)",
    "Median (50th percentile)",
    "Third Quartile (75th percentile)",
    "Maximum Score",
  ];

  const handleCohortChange = (quartile, index, value) => {
    setCohortMap((prev) => ({
      ...prev,
      [quartile]: prev[quartile].map((v, i) => (i === index ? value : v)),
    }));
  };

  const handleStreamChange = (quartile, index, value) => {
    setStreamMap((prev) => ({
      ...prev,
      [quartile]: prev[quartile].map((v, i) => (i === index ? value : v)),
    }));
  };

  const blocks = useMemo(() => {
    const out = [];

    out.push(
      <h2 key="title" className="content-page__title cs-title">
        <span className="content-page__title-index">2.</span>
        <span className="content-page__title-text">Competency Summary</span>
      </h2>,
    );

    out.push(
      <div key="overall" className="cs-overall">
        <h3 className="about-subtitle cs-overall__subtitle">
          2.1. Your Overall Score
        </h3>
        <div className="cs-overall__note">
          <em>
            Note: The overall score is calculated on a total score of 500 using
            weightages applicable for your respective streams.
          </em>
        </div>
        <div className="cs-gauge-wrap">
          <div className="cs-gauge">
            <div className="cs-gauge__label">Your Overall Score</div>
            <Gauge score={overallScore} />
          </div>
        </div>
        <ul className="cs-overall__bullets">
          <li>
            The overall score is calculated on a total score of 500 using
            weightages applicable for <strong>DELIVERY</strong>
            &nbsp;Stream.
          </li>
          <li>
            <em>
              Self ratings have been excluded for the purpose of this
              calculation
            </em>
          </li>
        </ul>
      </div>,
    );

    out.push(
      <div key="quartiles" className="cs-quartiles">
        <div className="cs-quartiles__grid">
          <QuartilePositionCard
            title="Your Quartile Position Cohort"
            valuesByQuartile={cohortMap}
            initialSelected={cohortInitialSelected}
            headers={quartileHeaders}
            onValueChange={handleCohortChange}
          />
          <div className="cs-quartiles__divider" />
          <QuartilePositionCard
            title="Your Quartile Position Stream"
            valuesByQuartile={streamMap}
            initialSelected={streamInitialSelected}
            headers={quartileHeaders}
            onValueChange={handleStreamChange}
          />
        </div>
      </div>,
    );

    return out;
  }, [cohortMap, streamMap, quartileHeaders, cohortInitialSelected, streamInitialSelected]);

  return (
    <AutoPaginatedSections
      blocks={blocks}
      startPage={startPage}
      // pageWidth={pageWidth}
      // pageHeight={pageHeight}
      // pagePadding={pagePadding}
      HeaderComponent={Header}
      contentClassName="content-page"
    />
  );
};

export default CompetencySummary;

