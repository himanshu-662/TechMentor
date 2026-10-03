"""Menti.ai Socratic Engine: What-If Prediction Natural Language Translation.
Translates ad-hoc natural language feature values, parses prediction queries,
runs real-time pipeline inferences, and explains predictions.
"""
import sys
import re
import json
import logging
import pickle
from typing import Dict, Any, Optional, Tuple, List
import numpy as np

# NumPy 1.x / 2.x pickle backward-compatibility shim
try:
    if hasattr(np, "core") and not hasattr(np, "_core"):
        sys.modules["numpy._core"] = np.core
        sys.modules["numpy._core.numeric"] = np.core.numeric
        sys.modules["numpy._core.multiarray"] = np.core.multiarray
except Exception:
    pass

from app.core.config import settings
from app.engines.menti_ai.rag.models.rag_models import StructuredRAGOutput

logger = logging.getLogger(__name__)


class PredictionHelper:
    """Parses input variables from natural language queries and runs inference on trained models."""

    @classmethod
    def extract_feature_inputs(cls, query_text: str) -> Dict[str, Any]:
        """
        Extract input feature key-value pairs from multiple query formats:
        1. JSON formats: `{"Age": 25, "Fare": 50}` or `{'Age': 25, 'Fare': 50}`
        2. Key-Value pairs with `=`: `Age=25, Fare=50.5, Pclass=1, Sex="female"`
        3. Key-Value pairs with `:`: `Age: 25, Fare: 50.5, Pclass: 1, Sex: female`
        4. Natural language: `Age is 25, Fare is 50, and Pclass is 1` or `where age is 30 and salary is 75000`
        """
        extracted: Dict[str, Any] = {}
        text = query_text.strip()

        # 1. Try to find and parse JSON blocks: {...}
        json_match = re.search(r'(\{[\s\S]*?\})', text)
        if json_match:
            raw_json = json_match.group(1)
            # Replace single quotes with double quotes for valid JSON
            clean_json = raw_json.replace("'", '"')
            try:
                parsed = json.loads(clean_json)
                if isinstance(parsed, dict) and len(parsed) > 0:
                    for k, v in parsed.items():
                        extracted[str(k).strip()] = cls._cast_value(v)
                    return extracted
            except Exception:
                pass

        # 2. Key-value pairs with `=` or `:` (e.g., Age=25, Fare: 50.5, Pclass=1, Sex="female")
        kv_patterns = [
            r'([a-zA-Z_][a-zA-Z0-9_]*)\s*[:=]\s*[\'"]([^\'"]+)[\'"]',
            r'([a-zA-Z_][a-zA-Z0-9_]*)\s*[:=]\s*([^\s,;]+)'
        ]

        for pat in kv_patterns:
            for match in re.finditer(pat, text):
                key = match.group(1).strip()
                val_raw = match.group(2).strip().rstrip(',;?!.)]}')
                
                # Exclude common query words mistakenly captured as keys
                if key.lower() in {"model", "predict", "prediction", "step", "dataset", "query", "target", "output", "what", "if", "for", "with"}:
                    continue
                
                if key not in extracted:
                    extracted[key] = cls._cast_value(val_raw)

        # 3. Natural language statements: `key is val` (e.g. `age is 25 and fare is 50`)
        nl_pattern = r'\b([a-zA-Z_][a-zA-Z0-9_]*)\s+is\s+([\'"][^\'"]+[\'"]|[0-9\.]+|true|false|[a-zA-Z0-9_]+)'
        for match in re.finditer(nl_pattern, text, re.IGNORECASE):
            key = match.group(1).strip()
            val_raw = match.group(2).strip().strip('\'"').rstrip(',;?!.)]}')
            if key.lower() in {"model", "predict", "prediction", "step", "dataset", "target", "output", "it", "this", "that", "there"}:
                continue
            if key not in extracted:
                extracted[key] = cls._cast_value(val_raw)

        return extracted

    @classmethod
    def _cast_value(cls, val: Any) -> Any:
        """Helper to cast strings to int, float, bool, or trimmed string."""
        if isinstance(val, (int, float, bool)):
            return val
        s = str(val).strip().strip("'\"").rstrip('?,;!.)]}')
        if s.lower() == "true":
            return True
        if s.lower() == "false":
            return False
        # Try integer
        try:
            if re.match(r'^-?\d+$', s):
                return int(s)
        except Exception:
            pass
        # Try float
        try:
            if re.match(r'^-?\d*\.\d+$', s):
                return float(s)
        except Exception:
            pass
        return s

    @classmethod
    def execute_live_prediction(
        cls,
        dataset_id: Optional[str],
        inputs: Dict[str, Any]
    ) -> Tuple[Optional[Dict[str, Any]], Optional[str]]:
        """
        Execute prediction using ModelingEngine on the trained model.
        Returns (prediction_result_dict, error_message).
        """
        try:
            from app.engines.datamentor.modeling_engine import ModelingEngine
            from app.engines.datamentor.modeling.models import LivePredictRequest
        except ImportError:
            try:
                # pyrefly: ignore [missing-import]
                from app.modeling.modeling_engine import ModelingEngine
                # pyrefly: ignore [missing-import]
                from app.modeling.models import LivePredictRequest
            except ImportError:
                # pyrefly: ignore [missing-import]
                from backend.app.modeling.modeling_engine import ModelingEngine
                # pyrefly: ignore [missing-import]
                from backend.app.modeling.models import LivePredictRequest

        target_dataset_id = dataset_id

        # If dataset_id is missing or doesn't have a model, scan storage for the latest trained model
        if not target_dataset_id:
            target_dataset_id = cls._find_latest_trained_dataset_id()

        if not target_dataset_id:
            return None, "No active dataset or trained model found. Please load a dataset and complete Step 11: Model Fitting first."

        # Check if model artifact exists
        models_dir = ModelingEngine.get_models_dir(target_dataset_id)
        target_model_file = models_dir / "latest.pkl"
        if not target_model_file.exists():
            return None, f"No trained model artifact found for dataset '{target_dataset_id[:8]}...'. Please fit a model in Step 11 first."

        try:
            # If user provided no inputs at all, fetch sample default values from test split
            if not inputs:
                sample_resp = ModelingEngine.get_sample_instance(target_dataset_id)
                inputs = sample_resp.sample_values

            live_req = LivePredictRequest(inputs=inputs)
            live_resp = ModelingEngine.predict_live(target_dataset_id, live_req)

            result_dict = {
                "dataset_id": target_dataset_id,
                "model_id": live_resp.model_id,
                "model_type": live_resp.model_type,
                "task_type": live_resp.task_type,
                "target_column": live_resp.target_column,
                "predicted": live_resp.predicted,
                "predicted_label": live_resp.predicted_label,
                "probabilities": live_resp.probabilities,
                "confidence": live_resp.confidence,
                "raw_inputs": live_resp.raw_inputs,
                "transformed_vector": live_resp.transformed_vector,
                "top_contributing_features": live_resp.top_contributing_features,
                "explanation": live_resp.explanation,
                "message": live_resp.message,
                "timestamp": live_resp.timestamp
            }
            return result_dict, None
        except Exception as e:
            logger.exception("Prediction execution failed")
            return None, f"Prediction failed during inference: {str(e)}"

    @classmethod
    def _find_latest_trained_dataset_id(cls) -> Optional[str]:
        """Find the most recently modified dataset session that contains a trained model."""
        try:
            storage_dir = settings.STORAGE_DIR
            if not storage_dir.exists():
                return None
            
            candidates = []
            for session_dir in storage_dir.iterdir():
                if session_dir.is_dir():
                    pkl_file = session_dir / "models" / "latest.pkl"
                    if pkl_file.exists():
                        candidates.append((pkl_file.stat().st_mtime, session_dir.name, pkl_file))

            # Sort descending by mtime
            candidates.sort(key=lambda x: x[0], reverse=True)
            for _, session_name, pkl_path in candidates:
                try:
                    with open(pkl_path, "rb") as f:
                        payload = pickle.load(f)
                    if isinstance(payload, dict) and "model" in payload:
                        return session_name
                except Exception:
                    continue
            return None
        except Exception:
            return None

    @classmethod
    def format_prediction_response(
        cls,
        prediction_result: Dict[str, Any],
        question: str
    ) -> Tuple[str, StructuredRAGOutput, List[str]]:
        """
        Generate a pedagogical markdown answer and structured output cards from prediction results.
        """
        model_type = prediction_result.get("model_type", "Trained ML Model")
        task_type = prediction_result.get("task_type", "classification")
        target_col = prediction_result.get("target_column", "Target")
        predicted_val = prediction_result.get("predicted", "N/A")
        predicted_label = prediction_result.get("predicted_label") or str(predicted_val)
        confidence = prediction_result.get("confidence")
        probabilities = prediction_result.get("probabilities")
        raw_inputs = prediction_result.get("raw_inputs", {})
        top_features = prediction_result.get("top_contributing_features", [])

        # Build Direct Answer
        if task_type == "classification":
            conf_str = f" with **{round(confidence * 100, 1)}% confidence**" if confidence is not None else ""
            direct_ans = f"Based on the trained **{model_type}** model, the predicted outcome for **{target_col}** is **{predicted_label}**{conf_str}."
        else:
            direct_ans = f"Based on the trained **{model_type}** regression model, the predicted continuous value for **{target_col}** is **{predicted_val}**."

        # Key Concepts list
        key_concepts = []
        if task_type == "classification" and probabilities:
            prob_items = [f"Class {cls_name}: {round(p * 100, 1)}%" for cls_name, p in probabilities.items()]
            key_concepts.append(f"Predicted Class Probabilities: {', '.join(prob_items)}")
        
        # Feature impact concepts
        if top_features:
            top_3 = top_features[:3]
            for feat_item in top_3:
                f_name = feat_item.get("feature", "Feature")
                f_val = feat_item.get("value", 0.0)
                direction = feat_item.get("direction", "positive")
                impact = feat_item.get("impact", 0.0)
                key_concepts.append(f"Feature '{f_name}' (value: {f_val}) pushed prediction in {direction} direction (impact: {impact})")
        else:
            key_concepts.append(f"Inputs transformed through data preprocessors & encoders into {len(prediction_result.get('transformed_vector', {}))} tensor features.")

        # Input summary string
        input_items_str = ", ".join([f"{k} = {v}" for k, v in raw_inputs.items()]) if raw_inputs else "default sample vector"

        # Practical guidance
        guidance = (
            f"The prediction was generated using the active serialized artifact in Step 12 (Prediction). "
            f"Any unprovided feature variables were automatically imputed using training set medians/modes to guarantee consistent tensor dimensions."
        )

        # Code Example snippet
        code_example = (
            f"# Live Prediction in Scikit-Learn\n"
            f"import numpy as np\n"
            f"import pandas as pd\n\n"
            f"# Input vector provided in query\n"
            f"input_data = {json.dumps(raw_inputs, indent=2)}\n\n"
            f"# Model inference (Step 12)\n"
            f"# prediction = model.predict(transformed_input)\n"
            f"# Output -> {predicted_val}"
        )

        dataset_insights = (
            f"Target variable: '{target_col}' | Task: {task_type.capitalize()} | "
            f"Model: {model_type} | Evaluated features: {len(raw_inputs)} input variables"
        )

        follow_ups = [
            f"What if I increase {list(raw_inputs.keys())[0]} by 20%?" if raw_inputs else "What if I change key feature values?",
            "How does this model calculate confidence intervals?",
            f"Why did the model assign higher weight to {top_features[0]['feature']}?" if top_features else "How do What-If simulators work?"
        ]

        # Markdown synthesis
        md_lines = [
            f"### Direct Answer\n{direct_ans}\n",
            f"### Query Input Variables Evaluated\n- **Provided Variables**: `{input_items_str}`\n- **Target Column**: `{target_col}`\n",
            f"### Key Concepts & Model Logic"
        ]
        for kc in key_concepts:
            md_lines.append(f"- {kc}")

        md_lines.append(f"\n### Practical Guidance & Code Example\n{guidance}\n\n```python\n{code_example}\n```\n")
        md_lines.append(f"### Active Dataset Application\n{dataset_insights}\n")
        md_lines.append(f"### Suggested Next Questions")
        for fu in follow_ups:
            md_lines.append(f"- {fu}")

        full_md = "\n".join(md_lines)

        structured_output = StructuredRAGOutput(
            summary=direct_ans,
            key_concepts=key_concepts,
            practical_guidance=guidance,
            code_example=code_example,
            dataset_insights=dataset_insights,
            follow_up_questions=follow_ups
        )

        return full_md, structured_output, follow_ups


__all__ = ["PredictionHelper"]
