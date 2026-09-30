"""
AI / ML Risk Model API Router
"""
from fastapi import APIRouter, File, UploadFile, HTTPException
import io
import pandas as pd
from app.ai.classifier import risk_classifier_singleton
from app.models.schemas import (
    AIModelPredictionInput,
    AIModelPredictionOutput,
    AITrainResponse
)

router = APIRouter(prefix="/ai", tags=["AI & Machine Learning"])

@router.post("/predict", response_model=AIModelPredictionOutput)
def predict_flood_risk(inp: AIModelPredictionInput):
    """
    Classify risk level using trained Random Forest Classifier and return feature contributions.
    """
    return risk_classifier_singleton.predict_risk(inp)

@router.post("/train", response_model=AITrainResponse)
def train_model(file: UploadFile = None):
    """
    Trigger retraining pipeline with custom CSV or regenerated physical shallow water synthetic set.
    """
    if file:
        try:
            content = file.file.read()
            df = pd.read_csv(io.BytesIO(content))
            return risk_classifier_singleton.train_model(df)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to process CSV file: {str(e)}")
    else:
        return risk_classifier_singleton.train_model()

@router.get("/feature-importance")
def get_feature_importances():
    """Retrieve relative feature weights in the ML classification model."""
    return {
        "model_type": "Random Forest Classifier (100 Trees, Depth 8)",
        "accuracy_pct": round(risk_classifier_singleton.train_accuracy * 100, 2),
        "feature_importances": risk_classifier_singleton.feature_importances_
    }
