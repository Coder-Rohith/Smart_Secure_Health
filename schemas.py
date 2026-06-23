"""
Pydantic schemas for request validation and input sanitization.
Ensures all API inputs are properly typed and within valid ranges.
"""

from pydantic import BaseModel, validator
from typing import Optional


class UserRegister(BaseModel):
    """Schema for user registration."""
    email: str
    name: str
    password: str
    role: Optional[str] = "user"

    @validator("email")
    def validate_email(cls, v):
        v = v.strip().lower()
        if "@" not in v or "." not in v.split("@")[-1]:
            raise ValueError("Invalid email format")
        if len(v) > 255:
            raise ValueError("Email too long")
        return v

    @validator("name")
    def validate_name(cls, v):
        v = v.strip()
        if len(v) < 2:
            raise ValueError("Name must be at least 2 characters")
        if len(v) > 100:
            raise ValueError("Name too long")
        return v

    @validator("password")
    def validate_password(cls, v):
        if len(v) < 6:
            raise ValueError("Password must be at least 6 characters")
        if len(v) > 128:
            raise ValueError("Password too long")
        return v

    @validator("role")
    def validate_role(cls, v):
        if v not in ("user", "doctor"):
            raise ValueError("Role must be 'user' or 'doctor'")
        return v


class UserLogin(BaseModel):
    """Schema for user login."""
    email: str
    password: str

    @validator("email")
    def validate_email(cls, v):
        return v.strip().lower()


class PatientData(BaseModel):
    """Schema for patient clinical data input with validation ranges."""
    age: int
    sex: int
    cp: int              # Chest pain type (0-3)
    trestbps: int        # Resting blood pressure
    chol: int            # Serum cholesterol (mg/dl)
    fbs: int             # Fasting blood sugar > 120 mg/dl (1=true, 0=false)
    restecg: int         # Resting ECG results (0-2)
    thalach: int         # Maximum heart rate achieved
    exang: int           # Exercise induced angina (1=yes, 0=no)
    oldpeak: float       # ST depression induced by exercise
    slope: int           # Slope of peak exercise ST segment (0-2)
    ca: int              # Number of major vessels colored by fluoroscopy (0-4)
    thal: int            # Thalassemia (0-3)

    @validator("age")
    def validate_age(cls, v):
        if v < 1 or v > 120:
            raise ValueError("Age must be between 1 and 120")
        return v

    @validator("sex")
    def validate_sex(cls, v):
        if v not in (0, 1):
            raise ValueError("Sex must be 0 (female) or 1 (male)")
        return v

    @validator("cp")
    def validate_cp(cls, v):
        if v < 0 or v > 3:
            raise ValueError("Chest pain type must be 0-3")
        return v

    @validator("trestbps")
    def validate_bp(cls, v):
        if v < 50 or v > 300:
            raise ValueError("Resting blood pressure must be between 50 and 300 mmHg")
        return v

    @validator("chol")
    def validate_cholesterol(cls, v):
        if v < 50 or v > 600:
            raise ValueError("Cholesterol must be between 50 and 600 mg/dl")
        return v

    @validator("fbs")
    def validate_fbs(cls, v):
        if v not in (0, 1):
            raise ValueError("Fasting blood sugar flag must be 0 or 1")
        return v

    @validator("restecg")
    def validate_restecg(cls, v):
        if v < 0 or v > 2:
            raise ValueError("Resting ECG results must be 0-2")
        return v

    @validator("thalach")
    def validate_thalach(cls, v):
        if v < 50 or v > 250:
            raise ValueError("Max heart rate must be between 50 and 250 bpm")
        return v

    @validator("exang")
    def validate_exang(cls, v):
        if v not in (0, 1):
            raise ValueError("Exercise angina must be 0 or 1")
        return v

    @validator("oldpeak")
    def validate_oldpeak(cls, v):
        if v < 0 or v > 10:
            raise ValueError("ST depression must be between 0 and 10")
        return v

    @validator("slope")
    def validate_slope(cls, v):
        if v < 0 or v > 2:
            raise ValueError("Slope must be 0-2")
        return v

    @validator("ca")
    def validate_ca(cls, v):
        if v < 0 or v > 4:
            raise ValueError("Number of major vessels must be 0-4")
        return v

    @validator("thal")
    def validate_thal(cls, v):
        if v < 0 or v > 3:
            raise ValueError("Thalassemia value must be 0-3")
        return v


class FeedbackData(BaseModel):
    """Schema for treatment feedback submission."""
    prediction_id: int
    disease: str
    treatment: str
    success: int  # 1 = helpful, 0 = not helpful

    @validator("success")
    def validate_success(cls, v):
        if v not in (0, 1):
            raise ValueError("Success must be 0 or 1")
        return v


class RecommendRequest(BaseModel):
    """Schema for treatment recommendation request."""
    disease: str

    @validator("disease")
    def validate_disease(cls, v):
        v = v.strip()
        if not v:
            raise ValueError("Disease field cannot be empty")
        return v
