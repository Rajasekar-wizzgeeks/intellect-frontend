import React, { useEffect } from "react";
import { FileText, Target, FileChartColumn } from "lucide-react";
import "../styles/home.scss";
import { useNavigate, useOutletContext } from "react-router-dom";

const HomePage = () => {
  const navigate = useNavigate();
  const { setIsHeader, setHeaderName } = useOutletContext();

  useEffect(() => {
    setHeaderName("Home");
  }, []);

  return (
    <div className="home">
      <div className="home__grid">
        <div className="home-card">
          <div className="home-card__topbar home-card__topbar--overall" />

          <div className="home-card__body">
            <div className="home-card__head">
              <div className="home-card__icon home-card__icon--overall">
                <FileText
                  style={{
                    width: 26,
                    height: 26,
                    color: "var(--color-warm-sand)",
                  }}
                />
              </div>

              <div className="home-card__badge home-card__badge--overall">
                ACTIVE
              </div>
            </div>

            <div className="home-card__content">
              <h2 className="home-card__title">Overall Report</h2>
              <div className="home-card__desc">
                Comprehensive overview of all performance metrics, data
                analysis, and key insights across all departments and time
                periods.
              </div>
            </div>

            {/* <div className="home-card__stats">
              <div className="home-stat">
                <div className="home-stat__label">Total Metrics</div>
                <div className="home-stat__value home-stat__value--green">
                  248
                </div>
              </div>

              <div className="home-stat">
                <div className="home-stat__label">Completion</div>
                <div className="home-stat__value home-stat__value--gold">
                  94%
                </div>
              </div>
            </div> */}

            <button
              type="button"
              className="home-card__cta home-card__cta--overall"
              onClick={() => navigate("/reports/user/list")}
            >
              View User List
            </button>
          </div>
        </div>

        <div className="home-card">
          <div className="home-card__topbar home-card__topbar--report360" />

          <div className="home-card__body">
            <div className="home-card__head">
              <div className="home-card__icon home-card__icon--report360">
                <Target
                  style={{ width: 26, height: 26, color: "var(--color-white)" }}
                />
              </div>

              <div className="home-card__badge home-card__badge--report360">
                UPDATED
              </div>
            </div>

            <div className="home-card__content">
              <h2 className="home-card__title">360° Report</h2>
              <div className="home-card__desc">
                Holistic multi-dimensional analysis providing complete
                visibility into stakeholder feedback, performance reviews.
              </div>
            </div>

            {/* <div className="home-card__stats">
              <div className="home-stat">
                <div className="home-stat__label">Respondents</div>
                <div className="home-stat__value home-stat__value--gold">
                  156
                </div>
              </div>

              <div className="home-stat">
                <div className="home-stat__label">Avg. Score</div>
                <div className="home-stat__value home-stat__value--green">
                  8.7
                </div>
              </div>
            </div> */}

            <button
              type="button"
              className="home-card__cta home-card__cta--report360"
              onClick={() => navigate("/user/feedback")}
            >
              View 360° Analysis
            </button>
          </div>
        </div>

        <div className="home-card">
          <div className="home-card__topbar home-card__topbar--dav360" />

          <div className="home-card__body">
            <div className="home-card__head">
              <div className="home-card__icon home-card__icon--dav360">
                <FileChartColumn
                  style={{ width: 26, height: 26, color: "var(--color-white)" }}
                />
              </div>

              <div className="home-card__badge home-card__badge--dav360">
                NEW
              </div>
            </div>

            <div className="home-card__content">
              <h2 className="home-card__title">DAV 360° Report</h2>
              <div className="home-card__desc">
                DAV 360 Degree Feedback summary report for institutional review
                and leadership insights.
              </div>
            </div>

            <button
              type="button"
              className="home-card__cta home-card__cta--dav360"
              onClick={() => navigate("/user/dav360")}
            >
              View DAV 360° PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
