"""
AI Machine Learning Risk Classifier
Uses Scikit-Learn Random Forest Classifier to categorize risk levels
Provides feature importance interpretation and model explainability.
"""
from typing import Dict, Any, Tuple
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score

from app.ai.dataset_generator import generate_synthetic_training_data
from app.models.schemas import AIModelPredictionInput, AIModelPredictionOutput, AITrainResponse

class FloodRiskClassifier:
    def __init__(self):
        self.model: RandomForestClassifier = None
        self.feature_names = [
            "flood_depth_m",
            "flow_velocity_ms",
            "arrival_time_min",
            "elevation_m",
            "distance_to_river_m",
            "population_density",
            "infrastructure_density"
        ]
        self.classes_ = ["LOW", "MODERATE", "HIGH", "CRITICAL"]
        self.feature_importances_: Dict[str, float] = {}
        self.train_accuracy = 0.0
        # Automatically train baseline
        self.train_model()

    def train_model(self, custom_df: pd.DataFrame = None) -> AITrainResponse:
        df = custom_df if custom_df is not None else generate_synthetic_training_data(1500)
        
        X = df[self.feature_names]
        y = df["risk_level"]
        
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42, stratify=y)
        
        clf = RandomForestClassifier(n_estimators=100, max_depth=8, random_state=42)
        clf.fit(X_train, y_train)
        
        self.model = clf
        self.classes_ = list(clf.classes_)
        
        # Extract feature importances
        importances = clf.feature_importances_
        self.feature_importances_ = {
            name: round(float(imp), 4)
            for name, imp in zip(self.feature_names, importances)
        }
        
        # Sort importances
        self.feature_importances_ = dict(
            sorted(self.feature_importances_.items(), key=lambda x: x[1], reverse=True)
        )
        
        y_pred = clf.predict(X_test)
        acc = float(accuracy_score(y_test, y_pred))
        self.train_accuracy = acc
        report = classification_report(y_test, y_pred, output_dict=True)
        
        return AITrainResponse(
            status="Model trained successfully with Random Forest (Synthetic Training Set)",
            model_accuracy=round(acc * 100, 2),
            train_samples_count=len(X_train),
            test_samples_count=len(X_test),
            classification_report=report
        )

    def predict_risk(self, inp: AIModelPredictionInput) -> AIModelPredictionOutput:
        if self.model is None:
            self.train_model()
            
        features = pd.DataFrame([{
            "flood_depth_m": inp.flood_depth_m,
            "flow_velocity_ms": inp.flow_velocity_ms,
            "arrival_time_min": inp.arrival_time_min,
            "elevation_m": inp.elevation_m,
            "distance_to_river_m": inp.distance_to_river_m,
            "population_density": inp.population_density,
            "infrastructure_density": inp.infrastructure_density
        }])
        
        pred_class = self.model.predict(features)[0]
        pred_probs = self.model.predict_proba(features)[0]
        
        prob_dict = {
            cls_name: round(float(prob), 4)
            for cls_name, prob in zip(self.classes_, pred_probs)
        }
        
        # Generate transparent explanation
        dominant_feature = list(self.feature_importances_.keys())[0]
        if inp.flood_depth_m > 2.0 or inp.flow_velocity_ms > 3.0:
            exp = f"High hydraulic hazard detected (Depth={inp.flood_depth_m}m, Velocity={inp.flow_velocity_ms}m/s). Model classified as {pred_class} with {prob_dict.get(pred_class, 0.0)*100:.1f}% confidence."
        elif inp.arrival_time_min < 20.0:
            exp = f"Urgent rapid wave arrival ({inp.arrival_time_min} mins) drives elevated exposure score."
        else:
            exp = f"Low hydrodynamic impact at {inp.distance_to_river_m}m distance with adequate elevation buffer."
            
        return AIModelPredictionOutput(
            predicted_risk_level=pred_class,
            risk_probability=prob_dict,
            feature_importance=self.feature_importances_,
            explanation=exp,
            model_type="Random Forest Classifier (Synthetic Hydrodynamic Training Set)"
        )

# Global singleton classifier
risk_classifier_singleton = FloodRiskClassifier()
