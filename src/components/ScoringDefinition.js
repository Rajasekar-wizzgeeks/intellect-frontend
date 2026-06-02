import React, { useMemo } from "react";
import AutoPaginatedSections from "./AutoPaginatedSections";
import Header from "./header";
import SectionChip from "./SectionChip";
import ReportInfoTable from "./reportInfoTable";
import "../styles/mainPage.scss";
import "../styles/contentPage.scss";
import "../styles/scoringDefinition.scss";

const ScoringDefinition = ({
  startPage = 8,
  pageWidth = 794,
  pageHeight = 942,
  pagePadding = 10,
}) => {
  const ratingRows = useMemo(
    () => [
      {
        label: "NA",
        value: "Not Observed",
        meaning:
          "The rater has had no opportunity to see this behaviour and therefore cannot judge it.",
      },
      {
        label: "1",
        value: "Gap",
        meaning:
          "Behaviour is rarely, if ever, displayed; clear shortfall against the role standard.",
      },
      {
        label: "2",
        value: "Development Opportunity",
        meaning:
          "Behaviour surfaces intermittently or at a minimal level; improvement will raise effectiveness.",
      },
      {
        label: "3",
        value: "At Par",
        meaning:
          "Behaviour meets expectations for the role; demonstrated with reasonable consistency.",
      },
      {
        label: "4",
        value: "Strength",
        meaning:
          "Behaviour is displayed frequently and with positive impact; a recognised asset.",
      },
      {
        label: "5",
        value: "Competence",
        meaning:
          "Behaviour is fully mastered and role-modelled; others look to this leader for guidance.",
      },
    ],
    []
  );

  const blocks = useMemo(() => {
    const out = [];

    out.push(
      <h2 key="title" className="content-page__title">
        <span className="content-page__title-index">1.3.</span>
        <span className="content-page__title-text">
          Scoring Definition & Rating Scale
        </span>
      </h2>
    );

    out.push(
      <p key="intro" className="about-intro">
        To keep feedback consistent and easy to interpret, every survey
        statement is rated on a <strong>six-point scale</strong>: five
        performance levels plus one “not observed” option for behaviours raters
        have not witnessed.
      </p>
    );

    out.push(
      <div key="table" className="content-page__table-score">
        <ReportInfoTable
          rows={ratingRows}
          headers={["Score", "Label", "What it means in practice"]}
          leftWidth="12%"
          midWidth="20%"
          rightWidth="68%"
          rowHeight={undefined}
          extraKey="meaning"
          className="report-info--scoring"
        />
      </div>
    );

    out.push(
      <div key="usage" className="sd-usage">
        <SectionChip text="How the scores are used in the report:" />
        <ul className="sd-usage__list">
          <li>
            <strong>Raw scores –</strong>
            <div className="sd-usage__note">
              Every element and behavioural indicator shows the score from each
              rater group (Self, Manager, Peers & Team members).
            </div>
          </li>
          <li className="sd-usage__item sd-usage__item--spaced">
            <strong>Use of Mean Scores in Evaluation –</strong>
            <div className="sd-usage__note">
              To maintain consistency and fairness in assessment, each score is
              calculated by taking the <strong>mean (average)</strong> of
              ratings provided within each respondent category. If a category
              includes multiple respondents, their individual scores are
              averaged to produce a single representative score for that group.
              This approach ensures that no single individual disproportionately influences the outcome, and that all feedback is weighted appropriately in the overall evaluation.
            </div>
          </li>
        </ul>
      </div>
    );

    out.push(
      <div key="more-usage" className="sd-more-usage">
        <ul className="sd-more-usage__list">
          <li className="sd-more-usage__item sd-more-usage__item--mt8">
            <strong>Colour bands for quick insight –</strong>
            <ul className="sd-more-usage__sublist">
              <li>
                ≤ 3.5 → <em>Developmental Opportunity</em> (flagged amber)
              </li>
              <li>
                &gt; 3.5 and ≤ 4.0 → <em>Strength</em> (flagged light green)
              </li>
              <li>
                &gt; 4.0 and ≤ 5.0 → <em>Competence</em> (flagged dark green)
              </li>
            </ul>
          </li>

          <li className="sd-more-usage__item sd-more-usage__item--mt18">
            <strong>Overall Score by Stream –</strong>
            <div className="sd-more-usage__note">
              The overall score is derived for each Leader based on the
              importance/weightage of each parameter based on the stream.
            </div>
          </li>

          <li className="sd-more-usage__item sd-more-usage__item--mt18">
            <strong>Quartile Positioning –</strong>
            <ul className="sd-more-usage__sublist">
              <li>
                <strong>First quartile</strong> : Scores that fall below the
                25th Percentile of total scores obtained by the population
              </li>
              <li>
                <strong>Second quartile</strong> : Scores that fall below the
                Median of total scores obtained by the population
              </li>
              <li>
                <strong>Third quartile</strong> : Scores that fall below the
                75th Percentile of total scores obtained by the population
              </li>
              <li>
                <strong>Fourth quartile</strong> : Scores that fall above the
                75th Percentile of total scores obtained by the population
              </li>
            </ul>
          </li>

          <li className="sd-more-usage__item sd-more-usage__item--mt18">
            <strong>Benchmark reference –</strong>
            <div className="sd-more-usage__note">
              Your element averages are also compared to the EVP-plus cohort
              norm to indicate relative standing (e.g., percentile position).
            </div>
          </li>
        </ul>
      </div>
    );

    return out;
  }, [ratingRows]);

  return (
    <AutoPaginatedSections
      blocks={blocks}
      startPage={startPage}
      // pageWidth={pageWidth}
      pageHeight={pageHeight}
      // pagePadding={pagePadding}
      HeaderComponent={Header}
      contentClassName="content-page"
    />
  );
};

export default ScoringDefinition;
