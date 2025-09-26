from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import logging
import uuid

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="PM Internship Scheme - Smart Matching API",
    description="AI-powered internship matching system with affirmative action support",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic Models
class CandidateRegistration(BaseModel):
    name: str
    email: str
    phone: str
    skills: List[str]
    qualifications: List[str]
    location_preference: List[str]
    current_location: str
    category: str  # General, OBC, SC, ST
    district_type: str  # Urban, Rural, Aspirational
    past_participation: bool = False
    experience_months: int = 0
    preferred_sectors: List[str] = []
    languages: List[str] = ["English"]

class IndustryRegistration(BaseModel):
    company_name: str
    contact_email: str
    contact_phone: str
    internship_title: str
    internship_description: str
    required_skills: List[str]
    preferred_qualifications: List[str]
    location: str
    sector: str
    internship_capacity: int
    duration_months: int
    stipend_range: str = "Not specified"
    remote_allowed: bool = False
    preferred_candidate_profile: str = ""

class MatchRequest(BaseModel):
    candidate_id: Optional[str] = None
    industry_id: Optional[str] = None
    top_n: int = 10
    min_score_threshold: float = 0.3

# In-memory storage
candidates_db: Dict[str, Dict[str, Any]] = {}
industries_db: Dict[str, Dict[str, Any]] = {}

# Dummy data for testing
def initialize_dummy_data():
    """Initialize dummy data for testing purposes"""
    
    # Dummy candidates
    dummy_candidates = [
        {
            "name": "Arjun Sharma",
            "email": "arjun.sharma@email.com",
            "phone": "+91-9876543210",
            "skills": ["Python", "Machine Learning", "Data Analysis", "SQL", "Django"],
            "qualifications": ["B.Tech Computer Science"],
            "location_preference": ["Delhi", "Bangalore", "Mumbai"],
            "current_location": "Delhi",
            "category": "General",
            "district_type": "Urban",
            "past_participation": False,
            "experience_months": 6,
            "preferred_sectors": ["Technology", "Data Science"],
            "languages": ["English", "Hindi"]
        },
        {
            "name": "Priya Patel",
            "email": "priya.patel@email.com",
            "phone": "+91-9876543211",
            "skills": ["Digital Marketing", "Content Writing", "Social Media", "SEO", "Analytics"],
            "qualifications": ["MBA Marketing"],
            "location_preference": ["Gujarat", "Mumbai", "Pune"],
            "current_location": "Ahmedabad",
            "category": "OBC",
            "district_type": "Rural",
            "past_participation": False,
            "experience_months": 12,
            "preferred_sectors": ["Marketing", "E-commerce"],
            "languages": ["English", "Hindi", "Gujarati"]
        },
        {
            "name": "Raj Kumar Singh",
            "email": "raj.kumar@email.com",
            "phone": "+91-9876543212",
            "skills": ["Financial Analysis", "Excel", "Power BI", "Risk Management", "Investment"],
            "qualifications": ["B.Com", "CFA Level 1"],
            "location_preference": ["Bihar", "Delhi", "Kolkata"],
            "current_location": "Patna",
            "category": "SC",
            "district_type": "Aspirational",
            "past_participation": True,
            "experience_months": 3,
            "preferred_sectors": ["Finance", "Banking"],
            "languages": ["English", "Hindi"]
        },
        {
            "name": "Ananya Reddy",
            "email": "ananya.reddy@email.com",
            "phone": "+91-9876543213",
            "skills": ["UI/UX Design", "Figma", "Adobe Creative Suite", "Prototyping", "User Research"],
            "qualifications": ["B.Des Interaction Design"],
            "location_preference": ["Bangalore", "Hyderabad", "Chennai"],
            "current_location": "Hyderabad",
            "category": "General",
            "district_type": "Urban",
            "past_participation": False,
            "experience_months": 8,
            "preferred_sectors": ["Design", "Technology"],
            "languages": ["English", "Telugu", "Hindi"]
        }
    ]
    
    # Dummy industries
    dummy_industries = [
        {
            "company_name": "TechCorp India",
            "contact_email": "hr@techcorp.com",
            "contact_phone": "+91-11-12345678",
            "internship_title": "Data Science Intern",
            "internship_description": "Work on ML models and data analytics projects",
            "required_skills": ["Python", "Machine Learning", "Data Analysis", "Statistics"],
            "preferred_qualifications": ["B.Tech", "M.Tech", "MCA"],
            "location": "Delhi",
            "sector": "Technology",
            "internship_capacity": 5,
            "duration_months": 6,
            "stipend_range": "₹25,000 - ₹35,000",
            "remote_allowed": True,
            "preferred_candidate_profile": "Fresh graduates with strong analytical skills"
        },
        {
            "company_name": "FinanceHub Solutions",
            "contact_email": "careers@financehub.com",
            "contact_phone": "+91-22-87654321",
            "internship_title": "Financial Analyst Intern",
            "internship_description": "Support investment research and financial modeling",
            "required_skills": ["Financial Analysis", "Excel", "Risk Management", "Investment"],
            "preferred_qualifications": ["B.Com", "MBA Finance", "CA"],
            "location": "Mumbai",
            "sector": "Finance",
            "internship_capacity": 3,
            "duration_months": 4,
            "stipend_range": "₹20,000 - ₹30,000",
            "remote_allowed": False,
            "preferred_candidate_profile": "Commerce graduates with finance background"
        },
        {
            "company_name": "Creative Design Studio",
            "contact_email": "hello@creativestudio.com",
            "contact_phone": "+91-80-11223344",
            "internship_title": "UX Design Intern",
            "internship_description": "Design user interfaces for mobile and web applications",
            "required_skills": ["UI/UX Design", "Figma", "Prototyping", "User Research"],
            "preferred_qualifications": ["B.Des", "M.Des", "Diploma in Design"],
            "location": "Bangalore",
            "sector": "Design",
            "internship_capacity": 2,
            "duration_months": 5,
            "stipend_range": "₹18,000 - ₹28,000",
            "remote_allowed": True,
            "preferred_candidate_profile": "Creative individuals with portfolio"
        },
        {
            "company_name": "Digital Marketing Pro",
            "contact_email": "jobs@digitalmarketingpro.com",
            "contact_phone": "+91-79-99887766",
            "internship_title": "Digital Marketing Intern",
            "internship_description": "Manage social media campaigns and content creation",
            "required_skills": ["Digital Marketing", "Social Media", "Content Writing", "SEO"],
            "preferred_qualifications": ["MBA Marketing", "BBA", "Mass Communication"],
            "location": "Ahmedabad",
            "sector": "Marketing",
            "internship_capacity": 4,
            "duration_months": 3,
            "stipend_range": "₹15,000 - ₹25,000",
            "remote_allowed": True,
            "preferred_candidate_profile": "Creative marketers with social media experience"
        }
    ]
    
    # Register dummy candidates
    for candidate in dummy_candidates:
        candidate_id = str(uuid.uuid4())
        candidate_data = candidate.copy()
        candidate_data.update({
            "id": candidate_id,
            "registration_date": datetime.now().isoformat(),
            "status": "active"
        })
        candidates_db[candidate_id] = candidate_data
    
    # Register dummy industries
    for industry in dummy_industries:
        industry_id = str(uuid.uuid4())
        industry_data = industry.copy()
        industry_data.update({
            "id": industry_id,
            "registration_date": datetime.now().isoformat(),
            "status": "active",
            "filled_positions": 0
        })
        industries_db[industry_id] = industry_data

class MatchingEngine:
    """AI-powered matching engine for candidates and internships"""
    
    @staticmethod
    def calculate_skills_similarity(candidate_skills: List[str], required_skills: List[str]) -> float:
        """Calculate cosine similarity between candidate skills and required skills"""
        if not candidate_skills or not required_skills:
            return 0.0
        
        # Create skill documents
        candidate_doc = " ".join(candidate_skills)
        required_doc = " ".join(required_skills)
        
        # Calculate TF-IDF and cosine similarity
        vectorizer = TfidfVectorizer()
        try:
            tfidf_matrix = vectorizer.fit_transform([candidate_doc, required_doc])
            similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
            return float(similarity)
        except:
            # Fallback to simple intersection-based similarity
            candidate_set = set(skill.lower() for skill in candidate_skills)
            required_set = set(skill.lower() for skill in required_skills)
            intersection = len(candidate_set.intersection(required_set))
            union = len(candidate_set.union(required_set))
            return intersection / union if union > 0 else 0.0
    
    @staticmethod
    def calculate_location_preference_score(candidate_preferences: List[str], 
                                          industry_location: str) -> float:
        """Calculate location preference match score"""
        if not candidate_preferences:
            return 0.5  # Neutral score if no preference specified
        
        # Direct match
        if industry_location in candidate_preferences:
            return 1.0
        
        # Regional proximity (simplified)
        region_mapping = {
            "Delhi": ["NCR", "North India"],
            "Mumbai": ["Maharashtra", "West India"], 
            "Bangalore": ["Karnataka", "South India"],
            "Hyderabad": ["Telangana", "South India"],
            "Chennai": ["Tamil Nadu", "South India"],
            "Kolkata": ["West Bengal", "East India"],
            "Pune": ["Maharashtra", "West India"],
            "Ahmedabad": ["Gujarat", "West India"],
            "Patna": ["Bihar", "East India"]
        }
        
        industry_region = region_mapping.get(industry_location, [])
        for pref in candidate_preferences:
            if pref in industry_region:
                return 0.7
        
        return 0.2  # Low score for no regional match
    
    @staticmethod
    def calculate_affirmative_action_bonus(candidate: Dict[str, Any]) -> float:
        """Calculate bonus score for affirmative action considerations"""
        bonus = 0.0
        
        # Category-based bonus
        category_bonus = {
            "ST": 0.25,
            "SC": 0.20,
            "OBC": 0.15,
            "General": 0.0
        }
        bonus += category_bonus.get(candidate.get("category", "General"), 0.0)
        
        # District type bonus
        district_bonus = {
            "Aspirational": 0.20,
            "Rural": 0.15,
            "Urban": 0.0
        }
        bonus += district_bonus.get(candidate.get("district_type", "Urban"), 0.0)
        
        # First-time participation bonus
        if not candidate.get("past_participation", False):
            bonus += 0.10
        
        return min(bonus, 0.5)  # Cap at 50% bonus
    
    @staticmethod
    def calculate_qualification_match(candidate_qualifications: List[str], 
                                    preferred_qualifications: List[str]) -> float:
        """Calculate qualification match score"""
        if not preferred_qualifications:
            return 0.5  # Neutral if no preference
        
        candidate_quals = set(qual.lower() for qual in candidate_qualifications)
        preferred_quals = set(qual.lower() for qual in preferred_qualifications)
        
        # Direct match
        if candidate_quals.intersection(preferred_quals):
            return 1.0
        
        # Partial match based on keywords
        keywords_match = 0
        for c_qual in candidate_quals:
            for p_qual in preferred_quals:
                if any(keyword in c_qual for keyword in p_qual.split()) or \
                   any(keyword in p_qual for keyword in c_qual.split()):
                    keywords_match += 1
        
        return min(keywords_match * 0.3, 0.8)
    
    @classmethod
    def calculate_match_score(cls, candidate: Dict[str, Any], 
                            industry: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate comprehensive match score between candidate and industry"""
        
        # Component scores
        skills_score = cls.calculate_skills_similarity(
            candidate.get("skills", []), 
            industry.get("required_skills", [])
        )
        
        location_score = cls.calculate_location_preference_score(
            candidate.get("location_preference", []),
            industry.get("location", "")
        )
        
        qualification_score = cls.calculate_qualification_match(
            candidate.get("qualifications", []),
            industry.get("preferred_qualifications", [])
        )
        
        affirmative_bonus = cls.calculate_affirmative_action_bonus(candidate)
        
        # Sector preference score
        sector_score = 1.0 if industry.get("sector", "") in candidate.get("preferred_sectors", []) else 0.3
        
        # Experience penalty for over-qualification (if specified)
        experience_penalty = 0.0
        if candidate.get("experience_months", 0) > 24:  # More than 2 years
            experience_penalty = 0.1
        
        # Weighted final score
        base_score = (
            skills_score * 0.35 +           # 35% weight
            location_score * 0.20 +         # 20% weight  
            qualification_score * 0.15 +    # 15% weight
            sector_score * 0.15 +           # 15% weight
            0.15                            # 15% base score
        )
        
        final_score = min(base_score + affirmative_bonus - experience_penalty, 1.0)
        
        return {
            "overall_score": round(final_score, 3),
            "skills_score": round(skills_score, 3),
            "location_score": round(location_score, 3),
            "qualification_score": round(qualification_score, 3),
            "sector_score": round(sector_score, 3),
            "affirmative_bonus": round(affirmative_bonus, 3),
            "experience_penalty": round(experience_penalty, 3)
        }

# API Endpoints
@app.on_event("startup")
async def startup_event():
    """Initialize dummy data on startup"""
    initialize_dummy_data()
    logger.info(f"Initialized {len(candidates_db)} candidates and {len(industries_db)} industries")

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "PM Internship Scheme - Smart Matching API",
        "status": "active",
        "candidates_count": len(candidates_db),
        "industries_count": len(industries_db),
        "timestamp": datetime.now().isoformat()
    }

@app.post("/register_candidate")
async def register_candidate(candidate: CandidateRegistration):
    """Register a new candidate"""
    try:
        candidate_id = str(uuid.uuid4())
        candidate_data = candidate.dict()
        candidate_data.update({
            "id": candidate_id,
            "registration_date": datetime.now().isoformat(),
            "status": "active"
        })
        
        candidates_db[candidate_id] = candidate_data
        
        logger.info(f"Registered candidate: {candidate.name} (ID: {candidate_id})")
        
        return {
            "status": "success",
            "message": "Candidate registered successfully",
            "candidate_id": candidate_id,
            "data": candidate_data
        }
    
    except Exception as e:
        logger.error(f"Error registering candidate: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")

@app.post("/register_industry")
async def register_industry(industry: IndustryRegistration):
    """Register a new industry/internship provider"""
    try:
        industry_id = str(uuid.uuid4())
        industry_data = industry.dict()
        industry_data.update({
            "id": industry_id,
            "registration_date": datetime.now().isoformat(),
            "status": "active",
            "filled_positions": 0
        })
        
        industries_db[industry_id] = industry_data
        
        logger.info(f"Registered industry: {industry.company_name} (ID: {industry_id})")
        
        return {
            "status": "success",
            "message": "Industry registered successfully", 
            "industry_id": industry_id,
            "data": industry_data
        }
    
    except Exception as e:
        logger.error(f"Error registering industry: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")

@app.post("/match_internships")
async def match_internships(request: MatchRequest):
    """AI-powered internship matching endpoint"""
    try:
        matches = []
        
        # If specific candidate ID provided, match only that candidate
        if request.candidate_id:
            if request.candidate_id not in candidates_db:
                raise HTTPException(status_code=404, detail="Candidate not found")
            
            candidate = candidates_db[request.candidate_id]
            
            for industry_id, industry in industries_db.items():
                if industry.get("filled_positions", 0) < industry.get("internship_capacity", 0):
                    match_details = MatchingEngine.calculate_match_score(candidate, industry)
                    
                    if match_details["overall_score"] >= request.min_score_threshold:
                        matches.append({
                            "candidate_id": request.candidate_id,
                            "candidate_name": candidate.get("name"),
                            "industry_id": industry_id,
                            "company_name": industry.get("company_name"),
                            "internship_title": industry.get("internship_title"),
                            "match_score": match_details,
                            "available_positions": industry.get("internship_capacity", 0) - industry.get("filled_positions", 0)
                        })
        
        # If specific industry ID provided, find candidates for that industry
        elif request.industry_id:
            if request.industry_id not in industries_db:
                raise HTTPException(status_code=404, detail="Industry not found")
            
            industry = industries_db[request.industry_id]
            
            for candidate_id, candidate in candidates_db.items():
                match_details = MatchingEngine.calculate_match_score(candidate, industry)
                
                if match_details["overall_score"] >= request.min_score_threshold:
                    matches.append({
                        "candidate_id": candidate_id,
                        "candidate_name": candidate.get("name"),
                        "industry_id": request.industry_id,
                        "company_name": industry.get("company_name"),
                        "internship_title": industry.get("internship_title"),
                        "match_score": match_details,
                        "available_positions": industry.get("internship_capacity", 0) - industry.get("filled_positions", 0)
                    })
        
        # General matching - all candidates to all industries
        else:
            for candidate_id, candidate in candidates_db.items():
                for industry_id, industry in industries_db.items():
                    if industry.get("filled_positions", 0) < industry.get("internship_capacity", 0):
                        match_details = MatchingEngine.calculate_match_score(candidate, industry)
                        
                        if match_details["overall_score"] >= request.min_score_threshold:
                            matches.append({
                                "candidate_id": candidate_id,
                                "candidate_name": candidate.get("name"),
                                "industry_id": industry_id,
                                "company_name": industry.get("company_name"),
                                "internship_title": industry.get("internship_title"),
                                "match_score": match_details,
                                "available_positions": industry.get("internship_capacity", 0) - industry.get("filled_positions", 0)
                            })
        
        # Sort by match score (descending) and limit results
        matches.sort(key=lambda x: x["match_score"]["overall_score"], reverse=True)
        matches = matches[:request.top_n]
        
        logger.info(f"Generated {len(matches)} matches")
        
        return {
            "status": "success",
            "total_matches": len(matches),
            "matches": matches,
            "matching_criteria": {
                "min_score_threshold": request.min_score_threshold,
                "top_n": request.top_n,
                "candidate_id": request.candidate_id,
                "industry_id": request.industry_id
            },
            "timestamp": datetime.now().isoformat()
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in matching: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Matching failed: {str(e)}")

@app.get("/candidates")
async def get_candidates():
    """Get all registered candidates"""
    return {
        "status": "success",
        "count": len(candidates_db),
        "candidates": list(candidates_db.values())
    }

@app.get("/candidates/{candidate_id}")
async def get_candidate(candidate_id: str):
    """Get specific candidate details"""
    if candidate_id not in candidates_db:
        raise HTTPException(status_code=404, detail="Candidate not found")
    
    return {
        "status": "success",
        "candidate": candidates_db[candidate_id]
    }

@app.get("/industries") 
async def get_industries():
    """Get all registered industries"""
    return {
        "status": "success",
        "count": len(industries_db),
        "industries": list(industries_db.values())
    }

@app.get("/industries/{industry_id}")
async def get_industry(industry_id: str):
    """Get specific industry details"""
    if industry_id not in industries_db:
        raise HTTPException(status_code=404, detail="Industry not found")
    
    return {
        "status": "success", 
        "industry": industries_db[industry_id]
    }

@app.get("/stats")
async def get_system_stats():
    """Get system statistics"""
    active_candidates = sum(1 for c in candidates_db.values() if c.get("status") == "active")
    active_industries = sum(1 for i in industries_db.values() if i.get("status") == "active")
    total_capacity = sum(i.get("internship_capacity", 0) for i in industries_db.values())
    filled_positions = sum(i.get("filled_positions", 0) for i in industries_db.values())
    
    # Category distribution
    category_dist = {}
    district_dist = {}
    sector_dist = {}
    
    for candidate in candidates_db.values():
        category = candidate.get("category", "Unknown")
        district = candidate.get("district_type", "Unknown")
        category_dist[category] = category_dist.get(category, 0) + 1
        district_dist[district] = district_dist.get(district, 0) + 1
    
    for industry in industries_db.values():
        sector = industry.get("sector", "Unknown")
        sector_dist[sector] = sector_dist.get(sector, 0) + 1
    
    return {
        "status": "success",
        "system_stats": {
            "candidates": {
                "total": len(candidates_db),
                "active": active_candidates,
                "category_distribution": category_dist,
                "district_distribution": district_dist
            },
            "industries": {
                "total": len(industries_db),
                "active": active_industries,
                "sector_distribution": sector_dist
            },
            "internships": {
                "total_capacity": total_capacity,
                "filled_positions": filled_positions,
                "available_positions": total_capacity - filled_positions,
                "utilization_rate": round((filled_positions / total_capacity) * 100, 2) if total_capacity > 0 else 0
            }
        },
        "timestamp": datetime.now().isoformat()
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)