"""
LangChain Service - Social Media Post Generation
Generates structured social media posts from image descriptions using GPT-4o
"""

import os
from pathlib import Path
from typing import Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
from dotenv import load_dotenv

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

# Initialize LangChain with GPT-4o
llm = ChatOpenAI(
    model="gpt-4o",
    temperature=0.7,
    openai_api_key=os.getenv("OPENAI_API_KEY")
)


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


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "5006"))
    uvicorn.run(app, host="0.0.0.0", port=port)

