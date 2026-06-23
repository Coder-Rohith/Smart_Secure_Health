"""
Smart Healthcare API — Main Application
Integrates Deep Learning (prediction), Reinforcement Learning (recommendations),
and Cryptography & Network Security (auth, encryption).

Endpoints:
  POST /register    — User signup with bcrypt hashing
  POST /login       — JWT authentication
  POST /predict     — Disease prediction using MLP neural network
  POST /recommend   — RL-based treatment recommendations
  POST /feedback    — Submit feedback for RL adaptation
  GET  /stats       — Analytics data for dashboard
"""

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import pickle
import numpy as np
from datetime import datetime

from database import init_db, get_db, User, Prediction, Feedback
from security import hash_password, verify_password, create_token, get_current_user
from rl_engine import rl_engine
from schemas import UserRegister, UserLogin, PatientData, FeedbackData, RecommendRequest

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# App Initialization
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

app = FastAPI(
    title="Smart Healthcare API",
    description="AI-powered healthcare platform with DL, RL, and CNS",
    version="2.0.0",
)

# CORS — allow frontend origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database tables
init_db()

# Load trained Deep Learning model (MLPClassifier)
with open("model.pkl", "rb") as f:
    model = pickle.load(f)


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Utility Functions
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def calculate_risk_score(data: PatientData) -> float:
    """
    Calculate a composite risk score (0–100) based on clinical parameters.
    Higher score = higher cardiovascular risk.
    """
    score = 0.0

    # Age contribution (0–25 points)
    if data.age > 20:
        score += min(25, (data.age - 20) * 0.5)

    # Resting blood pressure contribution (0–20 points)
    if data.trestbps > 120:
        score += min(20, (data.trestbps - 120) * 0.3)

    # Cholesterol contribution (0–20 points)
    if data.chol > 200:
        score += min(20, (data.chol - 200) * 0.1)

    # Max heart rate — lower = higher risk (0–15 points)
    if data.thalach < 180:
        score += min(15, (180 - data.thalach) * 0.15)

    # Exercise-induced angina (0 or 10 points)
    if data.exang == 1:
        score += 10

    # Chest pain type contribution (0–10 points)
    score += min(10, data.cp * 3)

    return min(100, max(0, round(score, 1)))


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Health Check
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@app.get("/")
def home():
    return {
        "message": "Smart Healthcare API v2.0",
        "status": "running",
        "modules": ["Deep Learning", "Reinforcement Learning", "Cryptography"],
    }


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Authentication Endpoints (CNS)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@app.post("/register")
def register(data: UserRegister, db: Session = Depends(get_db)):
    """Register a new user with bcrypt-hashed password."""
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        email=data.email,
        name=data.name,
        password=hash_password(data.password),
        role=data.role,
    )
    db.add(user)
    db.commit()

    token = create_token({"user": data.email, "name": data.name, "role": data.role})
    return {
        "message": "Registration successful",
        "token": token,
        "name": data.name,
        "role": data.role,
    }


@app.post("/login")
def login(data: UserLogin, db: Session = Depends(get_db)):
    """Authenticate user and return JWT token."""
    user = db.query(User).filter(User.email == data.email).first()

    if not user or not verify_password(data.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_token({"user": user.email, "name": user.name, "role": user.role})
    return {
        "token": token,
        "name": user.name,
        "role": user.role,
    }


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Deep Learning — Disease Prediction
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@app.post("/predict")
def predict(
    data: PatientData,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Predict disease using the trained MLP neural network.
    Stores prediction in database and calculates risk score.
    """
    features = [
        data.age, data.sex, data.cp, data.trestbps, data.chol,
        data.fbs, data.restecg, data.thalach, data.exang,
        data.oldpeak, data.slope, data.ca, data.thal,
    ]

    try:
        prediction = model.predict([features])[0]
        probabilities = model.predict_proba([features])[0]
        confidence = round(float(max(probabilities)) * 100, 1)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Model prediction error: {str(e)}")

    result = "Heart Disease" if prediction == 1 else "No Disease"
    risk_score = calculate_risk_score(data)

    # Store prediction in database
    pred_record = Prediction(
        user_email=current_user["user"],
        age=data.age, sex=data.sex, cp=data.cp,
        trestbps=data.trestbps, chol=data.chol, fbs=data.fbs,
        restecg=data.restecg, thalach=data.thalach, exang=data.exang,
        oldpeak=data.oldpeak, slope=data.slope, ca=data.ca, thal=data.thal,
        result=result, risk_score=risk_score, confidence=confidence,
    )
    db.add(pred_record)
    db.commit()
    db.refresh(pred_record)

    return {
        "prediction_id": pred_record.id,
        "disease": result,
        "risk_score": risk_score,
        "confidence": confidence,
    }


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Reinforcement Learning — Recommendations
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@app.post("/recommend")
def recommend(
    data: RecommendRequest,
    current_user: dict = Depends(get_current_user),
):
    """
    Get personalized treatment recommendations.
    Uses RL epsilon-greedy strategy to balance exploration/exploitation.
    """
    treatments = rl_engine.get_recommendations(data.disease, top_k=4)
    return {
        "disease": data.disease,
        "treatments": treatments,
        "exploration_rate": rl_engine.get_exploration_rate(),
        "note": "Recommendations adapt based on community feedback",
    }


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Feedback — RL Reward Signal
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@app.post("/feedback")
def submit_feedback(
    data: FeedbackData,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Submit treatment feedback (reward signal for RL engine).
    Updates Q-values and adjusts future recommendations.
    """
    feedback = Feedback(
        prediction_id=data.prediction_id,
        user_email=current_user["user"],
        disease=data.disease,
        treatment=data.treatment,
        success=data.success,
    )
    db.add(feedback)
    db.commit()

    # Update RL engine with reward signal
    rl_engine.update(data.disease, data.treatment, data.success)

    return {
        "message": "Feedback recorded successfully",
        "exploration_rate": rl_engine.get_exploration_rate(),
    }


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Analytics — Dashboard Stats
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@app.get("/stats")
def get_stats(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Comprehensive analytics data for the dashboard.
    Includes prediction history, risk factors, feedback stats, and RL insights.
    """
    predictions = db.query(Prediction).all()
    feedbacks = db.query(Feedback).all()

    total = len(predictions)
    disease_count = sum(1 for p in predictions if p.result == "Heart Disease")
    no_disease_count = total - disease_count

    avg_risk = round(sum(p.risk_score for p in predictions) / total, 1) if total > 0 else 0
    avg_confidence = round(sum((p.confidence or 0) for p in predictions) / total, 1) if total > 0 else 0

    # Recent predictions (last 10)
    recent = db.query(Prediction).order_by(Prediction.created_at.desc()).limit(10).all()
    recent_list = [
        {
            "id": p.id,
            "age": p.age,
            "sex": "Male" if p.sex == 1 else "Female",
            "result": p.result,
            "risk_score": p.risk_score,
            "confidence": p.confidence,
            "date": p.created_at.strftime("%Y-%m-%d %H:%M") if p.created_at else None,
        }
        for p in recent
    ]

    # Risk factor averages
    if total > 0:
        risk_factors = {
            "avg_age": round(sum(p.age for p in predictions) / total, 1),
            "avg_bp": round(sum(p.trestbps for p in predictions) / total, 1),
            "avg_cholesterol": round(sum(p.chol for p in predictions) / total, 1),
            "avg_heart_rate": round(sum(p.thalach for p in predictions) / total, 1),
            "avg_oldpeak": round(sum(p.oldpeak for p in predictions) / total, 2),
        }
    else:
        risk_factors = {
            "avg_age": 0, "avg_bp": 0, "avg_cholesterol": 0,
            "avg_heart_rate": 0, "avg_oldpeak": 0,
        }

    # Feedback statistics
    total_feedback = len(feedbacks)
    positive = sum(1 for f in feedbacks if f.success == 1)

    # Monthly prediction aggregation
    monthly = {}
    for p in predictions:
        if p.created_at:
            key = p.created_at.strftime("%b %Y")
            monthly[key] = monthly.get(key, 0) + 1

    # Age group distribution
    age_groups = {"18-30": 0, "31-45": 0, "46-60": 0, "61-75": 0, "76+": 0}
    for p in predictions:
        if p.age <= 30:
            age_groups["18-30"] += 1
        elif p.age <= 45:
            age_groups["31-45"] += 1
        elif p.age <= 60:
            age_groups["46-60"] += 1
        elif p.age <= 75:
            age_groups["61-75"] += 1
        else:
            age_groups["76+"] += 1

    # RL engine stats
    rl_stats = rl_engine.get_stats()

    return {
        "total_predictions": total,
        "disease_distribution": {
            "Heart Disease": disease_count,
            "No Disease": no_disease_count,
        },
        "average_risk_score": avg_risk,
        "average_confidence": avg_confidence,
        "recent_predictions": recent_list,
        "risk_factors": risk_factors,
        "feedback_stats": {
            "total": total_feedback,
            "positive": positive,
            "negative": total_feedback - positive,
            "satisfaction_rate": round(positive / total_feedback * 100, 1) if total_feedback > 0 else 0,
        },
        "monthly_predictions": [{"month": k, "count": v} for k, v in monthly.items()],
        "age_distribution": age_groups,
        "rl_stats": rl_stats,
        "exploration_rate": rl_engine.get_exploration_rate(),
    }