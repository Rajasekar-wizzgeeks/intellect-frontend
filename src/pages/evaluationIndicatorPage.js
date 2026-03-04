import React from "react";
import EvaluatorCategoryBreakdown from "../components/EvaluatorCategoryBreakdown";
import BehaviouralIndicators from "../components/BehaviouralIndicators";

const EvaluationIndicatorPage = () => {
  return (
    <div>
      <EvaluatorCategoryBreakdown />
      <BehaviouralIndicators startPage={16} />
    </div>
  );
};

export default EvaluationIndicatorPage;
