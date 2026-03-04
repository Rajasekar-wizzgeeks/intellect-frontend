import React, { useMemo } from "react";
import "../styles/mainPage.scss";
import "../styles/contentPage.scss";
import "../styles/aboutAssessment.scss";
import Header from "./header";
import ReportInfoTable from "./reportInfoTable";
import AutoPaginatedSections from "./AutoPaginatedSections";

const AboutAssessmentPages = ({
  startPage = 4,
  pageWidth = 794,
  pageHeight = 842,
  pagePadding = 10,
}) => {
  const purposes = useMemo(
    () => [
      {
        lead: "See yourself clearly",
        tail: "Compare your self-view with how colleagues experience you.",
      },
      {
        lead: "Spot priority gaps",
        tail: "Pinpoint the 2–3 behaviours that will lift your impact fastest.",
      },
      {
        lead: "Shape your growth plan",
        tail: "Translate insights directly into your Individual Development Plan.",
      },
      {
        lead: "Fuel richer conversations",
        tail: "Give you and your manager/co-coach a common, data-based starting point for development dialogues.",
      },
      {
        lead: "Guide enterprise learning",
        tail: "Feed de-identified trends to L&D to focus organisation-wide capability-building where it matters most.",
      },
    ],
    []
  );

  const ELEMENTS = useMemo(
    () => [
      {
        label: "Leadership",
        desc: "Setting direction, leading with values, building psychological safety, and enabling others to think, decide, and grow",
      },
      {
        label: "Bandwidth",
        desc: "Staying grounded under pressure, simplifying complexity, thinking across time horizons, and mobilising people and resources beyond formal authority",
      },
      {
        label: "Sales & Customer Centricity",
        desc: "Deeply understanding customers and markets, translating insights into value, and building long-term, trust-based partnerships",
      },
      {
        label: "Collaboration",
        desc: "Building dependable relationships, working across boundaries, addressing challenges early, and solving problems collectively",
      },
      {
        label: "Operational Excellence",
        desc: "Creating reliable processes, using data to guide decisions, spotting risks early, and driving continuous improvement",
      },
      {
        label: "Results Orientation",
        desc: "Setting clear priorities, maintaining execution discipline, acting with urgency, and following through to deliver outcomes",
      },
      {
        label: "Expertise & Communication",
        desc: "Applying structured thinking, communicating with clarity and impact",
      },
    ],
    []
  );

  const elementRows = useMemo(
    () => ELEMENTS.map((e) => ({ label: e.label, value: e.desc })),
    [ELEMENTS]
  );

  // Build blocks (excluding Header so it repeats automatically on each page)
  const blocks = useMemo(
    () => [
      <h2 key="t1" className="about-title">
        <span className="about-title__num">1.1.</span>
        <span className="about-title__text">
          About the Assessment - LBSCORE 360°
        </span>
      </h2>,
      <p key="intro" className="about-intro">
        LBSCORE 360° is Intellect’s online, 360-degree feedback tool. In one
        60-minute survey it gathers ratings from you, your manager, and selected
        colleagues to show how often you display the leadership behaviours
        Intellect expects. Results arrive in a confidential, easy-to-read report
        the moment the last response is in.
      </p>,
      <h3 key="sub1" className="about-subtitle">
        The Seven LBSCORE Elements
      </h3>,
      <div key="tbl1" className="about-tablewrap">
        <ReportInfoTable
          headers={["Element", "What it's really about"]}
          rows={elementRows}
          leftWidth="26%"
          rightWidth="74%"
          rowHeight={52}
        />
      </div>,
      <h3 key="sub2" className="about-purpose-title">
        Purpose
      </h3>,
      <ol key="list1" className="about-purpose-list">
        {purposes.map((p, i) => (
          <li key={i}>
            <span className="about-purpose-lead">{p.lead}</span>
            <span className="about-purpose-tail"> – {p.tail}</span>
          </li>
        ))}
      </ol>,
    ],
    [elementRows, purposes]
  );

  return (
    <AutoPaginatedSections
      blocks={blocks}
      startPage={startPage}
      //   pageWidth={pageWidth}
      //   pageHeight={pageHeight}
      //   pagePadding={pagePadding}
      HeaderComponent={Header}
      contentClassName="content-page"
    />
  );
};

export default AboutAssessmentPages;
