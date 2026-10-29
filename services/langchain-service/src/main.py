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
import requests
from collections import Counter

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
    description="Generate structured social media posts from image descriptions and profile analysis",
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


class ProfileAnalysisRequest(BaseModel):
    """Request model for profile analysis"""
    user_id: int = Field(..., description="User ID to analyze", gt=0)


class ProfileAnalysis(BaseModel):
    """Structured profile analysis output"""
    summary: str = Field(description="Overall profile summary (2-3 paragraphs)")
    content_style: str = Field(description="Description of the types of content posted")
    engagement_level: str = Field(description="Assessment of engagement with followers")
    strengths: list[str] = Field(description="List of profile strengths (3-5 items)")
    recommendations: Optional[list[str]] = Field(
        default=None,
        description="Optional recommendations for improvement (3-5 items)"
    )


class ProfileAnalysisResponse(BaseModel):
    """Response model for profile analysis"""
    success: bool
    analysis: ProfileAnalysis
    metrics: dict = Field(description="Raw metrics used for analysis")


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

# Profile analysis output parser
profile_analysis_parser = PydanticOutputParser(pydantic_object=ProfileAnalysis)

# Profile analysis prompt template
profile_analysis_template = ChatPromptTemplate.from_messages([
    ("system", """You are an expert social media analyst. 
Analyze user profiles based on their posting behavior, engagement metrics, and interaction patterns.

Your task is to create a comprehensive profile analysis that includes:
1. A summary (2-3 paragraphs) describing the user's overall presence and style
2. Content style analysis - what types of posts they create
3. Engagement assessment - how well they interact with their audience
4. Strengths - what they're doing well (3-5 items)
5. Recommendations - suggestions for improvement (3-5 items, optional)

Be specific, constructive, and data-driven in your analysis.
{format_instructions}"""),
    ("human", """Analyze the following user profile data:

Username: {username}
Bio: {bio}
Total Posts: {total_posts}

Post Categories Distribution:
{categories}

Most Common Tags:
{tags}

Engagement Metrics:
- Average Likes per Post: {avg_likes:.1f}
- Average Comments per Post: {avg_comments:.1f}
- Total Likes: {total_likes}
- Total Comments: {total_comments}
- Comment Response Rate: {response_rate:.1f}% (percentage of comments where the user replied)

Post Engagement Details:
{engagement_details}

Generate a comprehensive, insightful profile analysis.""")
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


# Service URLs for fetching data
AUTH_SERVICE_URL = os.getenv("AUTH_SERVICE_URL", "http://auth-service:5001")
STORY_SERVICE_URL = os.getenv("STORY_SERVICE_URL", "http://story-service:5002")
SOCIAL_SERVICE_URL = os.getenv("SOCIAL_SERVICE_URL", "http://social-service:5003")


async def fetch_user_profile(user_id: int):
    """Fetch user profile from auth service"""
    try:
        # Note: In production, you may need to add service-to-service authentication
        # For now, this assumes internal network access or public endpoints
        response = requests.get(
            f"{AUTH_SERVICE_URL}/api/auth/profile/{user_id}",
            timeout=5,
            headers={"Content-Type": "application/json"}
        )
        if response.status_code == 200:
            data = response.json()
            return data.get("user") or data
        elif response.status_code == 401 or response.status_code == 403:
            # If auth is required, try to get user data from story service instead
            # by checking posts to get username
            print(f"Auth required for profile endpoint, trying alternative approach")
            return None
        return None
    except Exception as e:
        print(f"Error fetching user profile: {e}")
        return None


async def fetch_user_posts(user_id: int):
    """Fetch user posts from story service"""
    try:
        response = requests.get(
            f"{STORY_SERVICE_URL}/api/stories/user/{user_id}",
            timeout=10,
            headers={"Content-Type": "application/json"}
        )
        if response.status_code == 200:
            data = response.json()
            return data.get("stories") or data.get("data") or []
        return []
    except Exception as e:
        print(f"Error fetching user posts: {e}")
        return []


async def fetch_post_engagement(post_ids: list):
    """Fetch likes and comments for posts from social service"""
    if not post_ids:
        return {}, {}
    
    likes_map = {}
    comments_map = {}
    
    try:
        # Fetch likes and comments for all posts
        for post_id in post_ids:
            try:
                # Get likes
                likes_response = requests.get(
                    f"{SOCIAL_SERVICE_URL}/api/social/likes/{post_id}",
                    timeout=5
                )
                if likes_response.status_code == 200:
                    likes_data = likes_response.json()
                    likes_map[post_id] = len(likes_data.get("likes", []))
                else:
                    likes_map[post_id] = 0
                
                # Get comments
                comments_response = requests.get(
                    f"{SOCIAL_SERVICE_URL}/api/social/comments/{post_id}",
                    timeout=5
                )
                if comments_response.status_code == 200:
                    comments_data = comments_response.json()
                    comments = comments_data.get("comments", [])
                    comments_map[post_id] = comments
                else:
                    comments_map[post_id] = []
            except Exception as e:
                print(f"Error fetching engagement for post {post_id}: {e}")
                likes_map[post_id] = 0
                comments_map[post_id] = []
    except Exception as e:
        print(f"Error fetching post engagement: {e}")
    
    return likes_map, comments_map


def analyze_profile_data(user_profile, posts, likes_map, comments_map):
    """Analyze profile data and calculate metrics"""
    if not posts:
        return {
            "total_posts": 0,
            "categories": {},
            "tags": [],
            "avg_likes": 0,
            "avg_comments": 0,
            "total_likes": 0,
            "total_comments": 0,
            "response_rate": 0,
            "engagement_details": []
        }
    
    # Calculate category distribution
    categories = Counter(post.get("category", "Unknown") for post in posts)
    
    # Collect all tags
    all_tags = []
    for post in posts:
        if post.get("tags"):
            all_tags.extend(post.get("tags", []))
    tag_counts = Counter(all_tags)
    top_tags = [tag for tag, _ in tag_counts.most_common(10)]
    
    # Calculate engagement metrics
    total_likes = sum(likes_map.get(post.get("id"), 0) for post in posts)
    total_comments = sum(len(comments_map.get(post.get("id"), [])) for post in posts)
    avg_likes = total_likes / len(posts) if posts else 0
    avg_comments = total_comments / len(posts) if posts else 0
    
    # Calculate comment response rate
    # Check if user engages with comments on their posts
    # Response rate = percentage of posts with comments where the owner also commented
    user_username = user_profile.get("username", "")
    posts_with_comments = 0
    posts_with_owner_replies = 0
    
    for post in posts:
        post_id = post.get("id")
        comments = comments_map.get(post_id, [])
        post_owner_username = post.get("username", "")
        
        # Check if there are any comments from others (not the owner)
        has_other_comments = any(
            comment.get("username", "") != post_owner_username 
            for comment in comments
        )
        
        if has_other_comments:
            posts_with_comments += 1
            # Check if the owner has also commented (indicating engagement/reply)
            owner_has_commented = any(
                comment.get("username", "") == post_owner_username 
                for comment in comments
            )
            if owner_has_commented:
                posts_with_owner_replies += 1
    
    response_rate = (posts_with_owner_replies / posts_with_comments * 100) if posts_with_comments > 0 else 0
    
    # Create engagement details
    engagement_details = []
    for post in posts[:5]:  # Top 5 posts
        post_id = post.get("id")
        post_likes = likes_map.get(post_id, 0)
        post_comments = len(comments_map.get(post_id, []))
        engagement_details.append({
            "post_id": post_id,
            "caption": post.get("caption", "")[:50] + "...",
            "category": post.get("category", "Unknown"),
            "likes": post_likes,
            "comments": post_comments
        })
    
    return {
        "total_posts": len(posts),
        "categories": dict(categories),
        "tags": top_tags,
        "avg_likes": avg_likes,
        "avg_comments": avg_comments,
        "total_likes": total_likes,
        "total_comments": total_comments,
        "response_rate": response_rate,
        "engagement_details": engagement_details
    }


@app.post("/api/analyze-profile", response_model=ProfileAnalysisResponse)
async def analyze_profile(request: ProfileAnalysisRequest):
    """
    Analyze a user profile based on their posts, engagement, and interactions
    
    Args:
        request: ProfileAnalysisRequest containing user_id
    
    Returns:
        ProfileAnalysisResponse with generated analysis and metrics
    """
    try:
        # Check if OpenAI API key is set
        if not os.getenv("OPENAI_API_KEY"):
            raise HTTPException(
                status_code=500,
                detail="OPENAI_API_KEY environment variable is not set"
            )
        
        # Fetch user profile
        user_profile = await fetch_user_profile(request.user_id)
        
        # Fetch user posts
        posts = await fetch_user_posts(request.user_id)
        
        # If profile fetch failed but we have posts, extract user info from posts
        if not user_profile and posts:
            # Extract username from first post
            first_post = posts[0]
            user_profile = {
                "username": first_post.get("username", "Unknown"),
                "bio": "No bio available",
                "_id": request.user_id
            }
        elif not user_profile and not posts:
            raise HTTPException(
                status_code=404,
                detail=f"User with ID {request.user_id} not found or has no posts"
            )
        
        # Fetch engagement data
        post_ids = [post.get("id") for post in posts if post.get("id")]
        likes_map, comments_map = await fetch_post_engagement(post_ids)
        
        # Analyze the data
        metrics = analyze_profile_data(user_profile, posts, likes_map, comments_map)
        
        # Prepare data for LLM
        categories_str = "\n".join([f"- {cat}: {count} posts" for cat, count in metrics["categories"].items()])
        tags_str = ", ".join(metrics["tags"][:10]) if metrics["tags"] else "No tags"
        engagement_details_str = "\n".join([
            f"- Post: {detail['caption']} | Category: {detail['category']} | Likes: {detail['likes']} | Comments: {detail['comments']}"
            for detail in metrics["engagement_details"]
        ])
        
        # Format the prompt
        format_instructions = profile_analysis_parser.get_format_instructions()
        
        prompt = profile_analysis_template.format_messages(
            username=user_profile.get("username", "Unknown"),
            bio=user_profile.get("bio", "No bio available"),
            total_posts=metrics["total_posts"],
            categories=categories_str if categories_str else "No categories",
            tags=tags_str,
            avg_likes=metrics["avg_likes"],
            avg_comments=metrics["avg_comments"],
            total_likes=metrics["total_likes"],
            total_comments=metrics["total_comments"],
            response_rate=metrics["response_rate"],
            engagement_details=engagement_details_str if engagement_details_str else "No engagement data",
            format_instructions=format_instructions
        )
        
        # Generate response
        response = llm.invoke(prompt)
        
        # Parse the output
        parsed_output = profile_analysis_parser.parse(response.content)
        
        return ProfileAnalysisResponse(
            success=True,
            analysis=parsed_output,
            metrics=metrics
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error analyzing profile: {str(e)}"
        )


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "5006"))
    uvicorn.run(app, host="0.0.0.0", port=port)

