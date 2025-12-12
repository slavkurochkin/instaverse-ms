"""
Example script to test the LangChain service evaluation endpoints
"""

import requests
import json

# Service URL
SERVICE_URL = "http://localhost:5006"


def test_single_evaluation():
    """Test single evaluation endpoint"""
    payload = {
        "prediction": "There's nothing quite like watching the sun paint the sky in shades of orange and pink. Nature's daily masterpiece never fails to amaze! 🌅",
        "reference": "A beautiful sunset over the mountains with vibrant colors",
        "input_text": "A beautiful sunset over the mountains with vibrant orange and pink colors painting the sky",
        "criteria": {
            "helpfulness": "Is the output helpful and relevant?",
            "engagement": "Is the output engaging?"
        }
    }
    
    response = requests.post(
        f"{SERVICE_URL}/api/evaluate",
        json=payload
    )
    
    print("Single Evaluation Response:")
    print(json.dumps(response.json(), indent=2))
    print()


def test_batch_evaluation():
    """Test batch evaluation endpoint"""
    payload = {
        "generate_predictions": True,
        "test_cases": [
            {
                "input_text": "A beautiful sunset over the mountains with vibrant orange and pink colors painting the sky",
                "reference": "A sunset post about mountains and nature",
                "platform": "instagram",
                "tone": "friendly"
            },
            {
                "input_text": "A cozy coffee shop with vintage decor and plants hanging from the ceiling",
                "reference": "A coffee shop post with cozy atmosphere",
                "platform": "instagram",
                "tone": "casual"
            },
            {
                "input_text": "A professional team meeting in a modern office space with glass walls",
                "reference": "A professional LinkedIn post about teamwork",
                "platform": "linkedin",
                "tone": "professional"
            }
        ]
    }
    
    response = requests.post(
        f"{SERVICE_URL}/api/evaluate/batch",
        json=payload
    )
    
    print("Batch Evaluation Response:")
    result = response.json()
    
    # Print summary
    print("\n=== Evaluation Summary ===")
    summary = result["summary"]
    print(f"Total Tests: {summary['total_tests']}")
    print(f"Passed: {summary['passed']}")
    print(f"Failed: {summary['failed']}")
    print(f"Average Score: {summary['average_score']:.2f}")
    print(f"\nMetric Averages:")
    for metric, score in summary['metrics'].items():
        print(f"  {metric}: {score:.2f}")
    
    # Print detailed results
    print("\n=== Detailed Results ===")
    for i, detail in enumerate(result["detailed_results"]):
        print(f"\nTest Case {i + 1}:")
        print(f"  Input: {detail['input'][:50]}...")
        print(f"  Prediction: {detail['prediction'][:50]}...")
        print(f"  Average Score: {detail['average_score']:.2f}")
        print(f"  Passed: {detail['passed']}")
        print(f"  Evaluation Results:")
        for eval_result in detail['evaluation_results']:
            print(f"    - {eval_result['metric_name']}: {eval_result['score']:.2f}")
            if eval_result.get('reasoning'):
                print(f"      Reasoning: {eval_result['reasoning'][:100]}...")
    print()


def test_evaluation_with_generated_post():
    """Test evaluation on a generated post"""
    # First generate a post
    generate_payload = {
        "image_description": "A serene lake surrounded by mountains at sunrise",
        "platform": "instagram",
        "tone": "friendly"
    }
    
    print("Step 1: Generating post...")
    generate_response = requests.post(
        f"{SERVICE_URL}/api/generate-post",
        json=generate_payload
    )
    generated_post = generate_response.json()
    
    print(f"Generated Caption: {generated_post['post']['caption']}")
    print()
    
    # Then evaluate it
    print("Step 2: Evaluating generated post...")
    eval_payload = {
        "prediction": generated_post['post']['caption'],
        "input_text": generate_payload["image_description"],
        "criteria": {
            "relevance": "Is the caption relevant to the image description?",
            "engagement": "Is the caption engaging and likely to get likes/comments?",
            "length": "Is the caption an appropriate length for Instagram?"
        }
    }
    
    eval_response = requests.post(
        f"{SERVICE_URL}/api/evaluate",
        json=eval_payload
    )
    
    print("Evaluation Results:")
    result = eval_response.json()
    print(f"Average Score: {result['average_score']:.2f}")
    for eval_result in result['results']:
        print(f"  {eval_result['metric_name']}: {eval_result['score']:.2f}")
        if eval_result.get('reasoning'):
            print(f"    {eval_result['reasoning'][:150]}...")
    print()


if __name__ == "__main__":
    try:
        print("=" * 60)
        print("LangChain Service Evaluation Examples")
        print("=" * 60)
        print()
        
        # Test health check first
        health_response = requests.get(f"{SERVICE_URL}/health")
        print("Service Status:", health_response.json()["status"])
        print()
        
        # Run evaluation tests
        test_single_evaluation()
        print("\n" + "-" * 60 + "\n")
        test_evaluation_with_generated_post()
        print("\n" + "-" * 60 + "\n")
        test_batch_evaluation()
        
    except requests.exceptions.ConnectionError:
        print("Error: Could not connect to the service.")
        print("Make sure the service is running on", SERVICE_URL)
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
