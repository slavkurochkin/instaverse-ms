"""
LangChain Service - Social Media Post Generation
Generates structured social media posts from image descriptions using GPT-4o
"""

import os
from pathlib import Path
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
from dotenv import load_dotenv
from evaluation import EvaluationRunner, EvaluationResult, EvaluationSummary

# Load environment variables from .env file
# Try multiple locations: service directory, current directory, and /app (Docker)
env_paths = [
    Path(__file__).parent.parent / ".env",  # Service directory
    Path.cwd() / ".env",  # Current working directory
    Path("/app") / ".env",  # Docker container path
    Path(".env"),  # Relative to current directory
]

for env_path in env_paths:
    if env_path.exists():
        load_dotenv(env_path, override=False)
        break
else:
    # Fallback: try to load from any .env file in current directory
    load_dotenv(override=False)

# Set up LangSmith tracing if enabled
if os.getenv("LANGSMITH_TRACING", "false").lower() == "true":
    os.environ["LANGCHAIN_TRACING_V2"] = "true"
    os.environ["LANGCHAIN_ENDPOINT"] = "https://api.smith.langchain.com"
    os.environ["LANGCHAIN_API_KEY"] = os.getenv("LANGSMITH_API_KEY", "")
    os.environ["LANGCHAIN_PROJECT"] = os.getenv("LANGSMITH_PROJECT", "langchain-service")

app = FastAPI(
    title="LangChain Social Media Post Service",
    description="Generate structured social media posts from image descriptions",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize LangChain with GPT-4o for post generation
# Temperature 0.7 for creative, engaging content
llm = ChatOpenAI(
    model="gpt-4o",
    temperature=0.7,
    openai_api_key=os.getenv("OPENAI_API_KEY")
)

# Initialize separate LLM for evaluation (judge)
# Can use different model for cost/performance optimization
# Temperature 0.0 for consistent, objective evaluations
evaluation_model = os.getenv("EVALUATION_MODEL", "gpt-4o")  # Default to same model
evaluation_llm = ChatOpenAI(
    model=evaluation_model,
    temperature=0.0,  # Use 0 for consistent evaluation judgments
    openai_api_key=os.getenv("OPENAI_API_KEY")
)

# Initialize evaluation runner with dedicated evaluation LLM
try:
    evaluation_runner = EvaluationRunner(llm=evaluation_llm)
except Exception as e:
    print(f"Warning: Could not initialize evaluation runner: {e}")
    evaluation_runner = None


class SocialMediaPost(BaseModel):
    """Structured social media post output"""
    caption: str = Field(description="Main caption text (2-3 sentences)")
    call_to_action: Optional[str] = Field(
        default=None,
        description="Optional call to action"
    )
    tags: Optional[list[str]] = Field(
        default=None,
        description="Relevant hashtags (5-10 items)"
    )


class PostRequest(BaseModel):
    """Request model for post generation"""
    image_description: str = Field(
        ...,
        description="Description of the image",
        min_length=10,
        max_length=1000
    )
    platform: Optional[str] = Field(
        default="instagram",
        description="Target platform (instagram, twitter, facebook, linkedin)"
    )
    tone: Optional[str] = Field(
        default="friendly",
        description="Tone of the post (friendly, professional, casual, enthusiastic)"
    )


class PostResponse(BaseModel):
    """Response model for generated post"""
    success: bool
    post: SocialMediaPost
    platform: str
    tone: str


# Evaluation Models
class EvaluationRequest(BaseModel):
    """Request model for single evaluation"""
    prediction: str = Field(
        ...,
        description="The model's output to evaluate",
        min_length=1
    )
    reference: Optional[str] = Field(
        default=None,
        description="Reference/expected output for comparison"
    )
    input_text: Optional[str] = Field(
        default=None,
        description="The input that generated this prediction"
    )
    criteria: Optional[Dict[str, str]] = Field(
        default=None,
        description="Custom evaluation criteria"
    )
    threshold: float = Field(
        default=0.7,
        description="Score threshold for passing (0.0 to 1.0)",
        ge=0.0,
        le=1.0
    )


class EvaluationResponse(BaseModel):
    """Response model for evaluation results"""
    success: bool
    passed: bool = Field(description="Overall pass/fail status (average_score >= threshold)")
    threshold: float = Field(description="Threshold used for pass/fail determination")
    average_score: float = Field(
        description="Average score across all metrics"
    )
    results: List[EvaluationResult]


class TestCase(BaseModel):
    """A single test case for batch evaluation"""
    input_text: str = Field(
        ...,
        description="Input for the test case",
        min_length=1
    )
    reference: Optional[str] = Field(
        default=None,
        description="Expected/reference output"
    )
    platform: Optional[str] = Field(
        default="instagram",
        description="Target platform"
    )
    tone: Optional[str] = Field(
        default="friendly",
        description="Tone for the post"
    )
    criteria: Optional[Dict[str, str]] = Field(
        default=None,
        description="Custom evaluation criteria for this test case"
    )


class BatchEvaluationRequest(BaseModel):
    """Request model for batch evaluation"""
    test_cases: List[TestCase] = Field(
        ...,
        description="List of test cases to evaluate",
        min_items=1
    )
    generate_predictions: bool = Field(
        default=True,
        description="Whether to generate predictions using the model"
    )


class BatchEvaluationResponse(BaseModel):
    """Response model for batch evaluation"""
    success: bool
    summary: EvaluationSummary
    detailed_results: List[Dict[str, Any]] = Field(
        description="Detailed results for each test case"
    )


# Create output parser
output_parser = PydanticOutputParser(pydantic_object=SocialMediaPost)

# Create prompt template
prompt_template = ChatPromptTemplate.from_messages([
    ("system", """You are an expert social media content creator. 
Generate engaging, structured social media posts based on image descriptions.

Your task is to create:
1. A compelling caption (2-3 sentences)
2. An optional call to action
3. Relevant hashtags (5-10 items) as an array

Consider the platform and tone when creating the content.
{format_instructions}"""),
    ("human", """Create a social media post for the following image description:

Image Description: {image_description}
Platform: {platform}
Tone: {tone}

Generate a structured post that is engaging and appropriate for the specified platform and tone.""")
])


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "langchain-service",
        "model": "gpt-4o"
    }


@app.post("/api/generate-post", response_model=PostResponse)
async def generate_post(request: PostRequest):
    """
    Generate a structured social media post from an image description
    
    Args:
        request: PostRequest containing image description, platform, and tone
    
    Returns:
        PostResponse with generated structured post
    """
    try:
        # Check if OpenAI API key is set
        if not os.getenv("OPENAI_API_KEY"):
            raise HTTPException(
                status_code=500,
                detail="OPENAI_API_KEY environment variable is not set"
            )
        
        # Format the prompt
        format_instructions = output_parser.get_format_instructions()
        
        prompt = prompt_template.format_messages(
            image_description=request.image_description,
            platform=request.platform or "instagram",
            tone=request.tone or "friendly",
            format_instructions=format_instructions
        )
        
        # Generate response
        response = llm.invoke(prompt)
        
        # Parse the output
        parsed_output = output_parser.parse(response.content)
        
        return PostResponse(
            success=True,
            post=parsed_output,
            platform=request.platform or "instagram",
            tone=request.tone or "friendly"
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating post: {str(e)}"
        )


@app.post("/api/evaluate", response_model=EvaluationResponse)
async def evaluate_output(request: EvaluationRequest):
    """
    Evaluate a model output using multiple evaluation metrics
    
    Args:
        request: EvaluationRequest containing prediction, reference, and input
    
    Returns:
        EvaluationResponse with evaluation results
    """
    try:
        if not os.getenv("OPENAI_API_KEY"):
            raise HTTPException(
                status_code=500,
                detail="OPENAI_API_KEY environment variable is not set"
            )
        
        if evaluation_runner is None:
            raise HTTPException(
                status_code=503,
                detail="Evaluation service is not available. Please check service logs."
            )
        
        # Run comprehensive evaluation
        results = await evaluation_runner.evaluate_comprehensive(
            prediction=request.prediction,
            reference=request.reference,
            input_text=request.input_text,
            criteria=request.criteria,
            threshold=request.threshold
        )
        
        # Calculate average score (excluding errors)
        valid_scores = [r.score for r in results if r.score >= 0]
        average_score = sum(valid_scores) / len(valid_scores) if valid_scores else 0.0
        
        # Calculate overall passed status
        overall_passed = average_score >= request.threshold
        
        return EvaluationResponse(
            success=True,
            passed=overall_passed,
            threshold=request.threshold,
            results=results,
            average_score=average_score
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error evaluating output: {str(e)}"
        )


@app.post("/api/evaluate/batch", response_model=BatchEvaluationResponse)
async def evaluate_batch(request: BatchEvaluationRequest):
    """
    Run batch evaluation on multiple test cases
    
    Args:
        request: BatchEvaluationRequest containing test cases
    
    Returns:
        BatchEvaluationResponse with summary and detailed results
    """
    try:
        if not os.getenv("OPENAI_API_KEY"):
            raise HTTPException(
                status_code=500,
                detail="OPENAI_API_KEY environment variable is not set"
            )
        
        if evaluation_runner is None:
            raise HTTPException(
                status_code=503,
                detail="Evaluation service is not available. Please check service logs."
            )
        
        detailed_results = []
        all_scores = []
        metric_scores = {}
        
        for i, test_case in enumerate(request.test_cases):
            # Generate prediction if requested
            prediction = None
            if request.generate_predictions:
                # Create a PostRequest for generation
                post_request = PostRequest(
                    image_description=test_case.input_text,
                    platform=test_case.platform,
                    tone=test_case.tone
                )
                
                # Generate post
                format_instructions = output_parser.get_format_instructions()
                prompt = prompt_template.format_messages(
                    image_description=post_request.image_description,
                    platform=post_request.platform or "instagram",
                    tone=post_request.tone or "friendly",
                    format_instructions=format_instructions
                )
                response = llm.invoke(prompt)
                parsed_output = output_parser.parse(response.content)
                
                # Convert to string for evaluation
                prediction = parsed_output.caption
                if parsed_output.call_to_action:
                    prediction += f" {parsed_output.call_to_action}"
            
            # Run evaluation
            if prediction:
                eval_results = await evaluation_runner.evaluate_comprehensive(
                    prediction=prediction,
                    reference=test_case.reference,
                    input_text=test_case.input_text,
                    criteria=test_case.criteria
                )
            else:
                # If no prediction generated, we can't evaluate
                eval_results = [
                    EvaluationResult(
                        metric_name="error",
                        score=-1.0,
                        error="No prediction generated"
                    )
                ]
            
            # Collect scores
            case_scores = []
            for result in eval_results:
                if result.score >= 0:
                    case_scores.append(result.score)
                    all_scores.append(result.score)
                    
                    # Track scores by metric
                    metric_name = result.metric_name
                    if metric_name not in metric_scores:
                        metric_scores[metric_name] = []
                    metric_scores[metric_name].append(result.score)
            
            # Calculate average for this test case
            case_avg = sum(case_scores) / len(case_scores) if case_scores else 0.0
            
            detailed_results.append({
                "test_case_index": i,
                "input": test_case.input_text,
                "prediction": prediction,
                "reference": test_case.reference,
                "platform": test_case.platform,
                "tone": test_case.tone,
                "evaluation_results": [r.dict() for r in eval_results],
                "average_score": case_avg,
                "passed": case_avg >= 0.7  # Threshold for passing
            })
        
        # Calculate summary statistics
        total_tests = len(request.test_cases)
        passed = sum(1 for r in detailed_results if r["passed"])
        failed = total_tests - passed
        overall_avg = sum(all_scores) / len(all_scores) if all_scores else 0.0
        
        # Calculate average per metric
        metric_averages = {
            metric: sum(scores) / len(scores)
            for metric, scores in metric_scores.items()
        }
        
        summary = EvaluationSummary(
            total_tests=total_tests,
            passed=passed,
            failed=failed,
            average_score=overall_avg,
            metrics=metric_averages,
            results=detailed_results
        )
        
        return BatchEvaluationResponse(
            success=True,
            summary=summary,
            detailed_results=detailed_results
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error running batch evaluation: {str(e)}"
        )


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "5006"))
    uvicorn.run(app, host="0.0.0.0", port=port)

