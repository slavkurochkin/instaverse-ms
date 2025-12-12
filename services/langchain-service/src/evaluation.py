"""
LangChain Model Evaluation Module
Provides evaluation utilities for assessing model performance
"""

from typing import List, Dict, Any, Optional
from langchain.evaluation import EvaluatorType
from langchain.evaluation import load_evaluator
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
from pydantic import BaseModel, Field
import os


class EvaluationResult(BaseModel):
    """Result of a single evaluation metric"""
    metric_name: str = Field(description="Name of the evaluation metric")
    score: float = Field(description="Score (0.0 to 1.0 or -1.0 for error)")
    passed: bool = Field(description="Whether this metric passed (score >= threshold)")
    reasoning: Optional[str] = Field(
        default=None,
        description="Reasoning for the score"
    )
    error: Optional[str] = Field(
        default=None,
        description="Error message if evaluation failed"
    )


class EvaluationSummary(BaseModel):
    """Summary of evaluation results"""
    total_tests: int = Field(description="Total number of test cases")
    passed: int = Field(description="Number of tests that passed")
    failed: int = Field(description="Number of tests that failed")
    average_score: float = Field(description="Average score across all metrics")
    metrics: Dict[str, float] = Field(
        description="Average score per metric type"
    )
    results: List[Dict[str, Any]] = Field(
        description="Detailed results for each test case"
    )


class EvaluationRunner:
    """Runs evaluations on LangChain models"""
    
    def __init__(self, llm: Optional[ChatOpenAI] = None):
        """
        Initialize the evaluation runner
        
        Args:
            llm: Optional LLM instance for evaluations. If not provided, creates one.
                Uses EVALUATION_MODEL environment variable if set, otherwise defaults to gpt-4o.
        """
        if llm is None:
            # Use environment variable for evaluation model, default to gpt-4o
            evaluation_model = os.getenv("EVALUATION_MODEL", "gpt-4o")
            self.llm = ChatOpenAI(
                model=evaluation_model,
                temperature=0.0,  # Use 0 for consistent evaluation
                openai_api_key=os.getenv("OPENAI_API_KEY")
            )
        else:
            self.llm = llm
        
        # Initialize evaluators
        self.evaluators = {}
        self._initialize_evaluators()
    
    def _initialize_evaluators(self):
        """Initialize LangChain evaluators"""
        # Criteria evaluator - evaluates output against custom criteria
        try:
            self.evaluators["criteria"] = load_evaluator(
                EvaluatorType.CRITERIA,
                llm=self.llm
            )
        except Exception as e:
            print(f"Warning: Could not initialize criteria evaluator: {e}")
        
        # Embedding distance evaluator - measures semantic similarity
        try:
            self.evaluators["embedding_distance"] = load_evaluator(
                EvaluatorType.EMBEDDING_DISTANCE
            )
        except Exception as e:
            print(f"Warning: Could not initialize embedding distance evaluator: {e}")
        
        # String distance evaluator - measures exact/approximate string matching
        try:
            self.evaluators["string_distance"] = load_evaluator(
                EvaluatorType.STRING_DISTANCE
            )
        except Exception as e:
            print(f"Warning: Could not initialize string distance evaluator: {e}")
    
    async def evaluate_criteria(
        self,
        prediction: str,
        reference: Optional[str] = None,
        input_text: Optional[str] = None,
        criteria: Optional[Dict[str, str]] = None,
        threshold: float = 0.7
    ) -> EvaluationResult:
        """
        Evaluate output against custom criteria
        
        Args:
            prediction: The model's output to evaluate
            reference: Optional reference/expected output
            input_text: The input that generated this prediction
            criteria: Custom criteria dictionary (e.g., {"helpfulness": "Is the output helpful?"})
        
        Returns:
            EvaluationResult with score and reasoning
        """
        try:
            if "criteria" not in self.evaluators:
                return EvaluationResult(
                    metric_name="criteria",
                    score=-1.0,
                    passed=False,
                    error="Criteria evaluator not available"
                )
            
            # Default criteria for social media posts
            default_criteria = {
                "helpfulness": "Is the output helpful and relevant to the image description?",
                "conciseness": "Is the output concise and appropriate for social media?",
                "engagement": "Is the output engaging and likely to generate user interaction?",
                "appropriateness": "Is the output appropriate for the specified platform and tone?"
            }
            
            eval_criteria = criteria or default_criteria
            
            # Prepare evaluation input for criteria evaluator
            # Criteria evaluator uses evaluate_strings method
            eval_input = {
                "prediction": prediction,
                "input": input_text or ""
            }
            
            if reference:
                eval_input["reference"] = reference
            
            # Run evaluation using evaluate_strings method
            # Note: Criteria evaluator may need different parameters based on LangChain version
            try:
                result = self.evaluators["criteria"].evaluate_strings(
                    **eval_input,
                    criteria=eval_criteria
                )
            except TypeError:
                # Fallback: try without criteria parameter if version doesn't support it
                result = self.evaluators["criteria"].evaluate_strings(**eval_input)
            
            # Extract score (LangChain returns different formats)
            score = result.get("score", 0.0)
            if isinstance(score, dict):
                score = score.get("score", 0.0)
            
            # Normalize score to 0-1 range
            if score == 1 or score == "1" or (isinstance(score, str) and "PASS" in score.upper()):
                normalized_score = 1.0
            elif score == 0 or score == "0" or (isinstance(score, str) and "FAIL" in score.upper()):
                normalized_score = 0.0
            else:
                try:
                    normalized_score = float(score)
                except (ValueError, TypeError):
                    normalized_score = 0.5
            
            # Calculate passed status: score >= threshold (and not an error)
            passed = normalized_score >= threshold if normalized_score >= 0 else False
            
            return EvaluationResult(
                metric_name="criteria",
                score=normalized_score,
                passed=passed,
                reasoning=result.get("reasoning", result.get("value", ""))
            )
            
        except Exception as e:
            return EvaluationResult(
                metric_name="criteria",
                score=-1.0,
                passed=False,
                error=f"Evaluation error: {str(e)}"
            )
    
    async def evaluate_embedding_distance(
        self,
        prediction: str,
        reference: str,
        threshold: float = 0.7
    ) -> EvaluationResult:
        """
        Evaluate semantic similarity using embeddings
        
        Args:
            prediction: The model's output
            reference: Reference/expected output
        
        Returns:
            EvaluationResult with similarity score (higher is better)
        """
        try:
            if "embedding_distance" not in self.evaluators:
                return EvaluationResult(
                    metric_name="embedding_distance",
                    score=-1.0,
                    passed=False,
                    error="Embedding distance evaluator not available"
                )
            
            result = self.evaluators["embedding_distance"].evaluate_strings(
                prediction=prediction,
                reference=reference
            )
            
            # Embedding distance returns a score where higher is better
            # Normalize to 0-1 range
            score = result.get("score", 0.0)
            if isinstance(score, (int, float)):
                # If score is already normalized, use it
                if 0 <= score <= 1:
                    normalized_score = score
                else:
                    # Normalize from distance to similarity
                    normalized_score = max(0.0, min(1.0, 1.0 - abs(score)))
            else:
                normalized_score = 0.5
            
            # Calculate passed status
            passed = normalized_score >= threshold if normalized_score >= 0 else False
            
            return EvaluationResult(
                metric_name="embedding_distance",
                score=normalized_score,
                passed=passed,
                reasoning=f"Semantic similarity: {score}"
            )
            
        except Exception as e:
            return EvaluationResult(
                metric_name="embedding_distance",
                score=-1.0,
                passed=False,
                error=f"Evaluation error: {str(e)}"
            )
    
    async def evaluate_string_distance(
        self,
        prediction: str,
        reference: str,
        threshold: float = 0.7
    ) -> EvaluationResult:
        """
        Evaluate string similarity using distance metrics
        
        Args:
            prediction: The model's output
            reference: Reference/expected output
        
        Returns:
            EvaluationResult with similarity score
        """
        try:
            if "string_distance" not in self.evaluators:
                return EvaluationResult(
                    metric_name="string_distance",
                    score=-1.0,
                    passed=False,
                    error="String distance evaluator not available"
                )
            
            result = self.evaluators["string_distance"].evaluate_strings(
                prediction=prediction,
                reference=reference
            )
            
            score = result.get("score", 0.0)
            if isinstance(score, (int, float)):
                normalized_score = float(score)
            else:
                normalized_score = 0.5
            
            # Calculate passed status
            passed = normalized_score >= threshold if normalized_score >= 0 else False
            
            return EvaluationResult(
                metric_name="string_distance",
                score=normalized_score,
                passed=passed,
                reasoning=f"String similarity: {score}"
            )
            
        except Exception as e:
            return EvaluationResult(
                metric_name="string_distance",
                score=-1.0,
                passed=False,
                error=f"Evaluation error: {str(e)}"
            )
    
    async def evaluate_comprehensive(
        self,
        prediction: str,
        reference: Optional[str] = None,
        input_text: Optional[str] = None,
        criteria: Optional[Dict[str, str]] = None,
        threshold: float = 0.7
    ) -> List[EvaluationResult]:
        """
        Run comprehensive evaluation with multiple metrics
        
        Args:
            prediction: The model's output
            reference: Optional reference output
            input_text: The input that generated this prediction
            criteria: Optional custom criteria
            threshold: Score threshold for passing (default: 0.7)
        
        Returns:
            List of EvaluationResult objects with passed status
        """
        results = []
        
        # Always run criteria evaluation
        criteria_result = await self.evaluate_criteria(
            prediction=prediction,
            reference=reference,
            input_text=input_text,
            criteria=criteria,
            threshold=threshold
        )
        results.append(criteria_result)
        
        # Run embedding distance if reference is provided
        if reference:
            embedding_result = await self.evaluate_embedding_distance(
                prediction=prediction,
                reference=reference,
                threshold=threshold
            )
            results.append(embedding_result)
            
            string_result = await self.evaluate_string_distance(
                prediction=prediction,
                reference=reference,
                threshold=threshold
            )
            results.append(string_result)
        
        return results
