from typing import Optional
from fastapi import APIRouter, Path, UploadFile, File, Form
from fastapi.responses import FileResponse
from app.modeling.models import (
    ModelFitRequest,
    ModelFitResponse,
    ModelSummaryResponse,
    ModelPredictRequest,
    ModelPredictResponse,
    SinglePredictRequest,
    SinglePredictResponse,
    SampleInstanceResponse,
    OriginalSchemaResponse,
    LivePredictRequest,
    LivePredictResponse,
    BatchNewPredictRequest,
    BatchNewPredictResponse,
    PredictTemplateResponse,
    EvaluationRequest,
    EvaluationResponse
)
from app.modeling.modeling_engine import ModelingEngine

router = APIRouter(prefix="/datasets/{dataset_id}/modeling", tags=["modeling"])
legacy_modeling_router = APIRouter(prefix="/modeling/{dataset_id}", tags=["modeling"])


@router.get("/summary", response_model=ModelSummaryResponse)
@router.get("", response_model=ModelSummaryResponse)
@legacy_modeling_router.get("/summary", response_model=ModelSummaryResponse)
def get_modeling_summary(
    dataset_id: str = Path(..., description="Unique dataset identifier")
):
    """Retrieve modeling partition status, candidate algorithms, and task type."""
    return ModelingEngine.get_summary(dataset_id)


@router.post("/fit", response_model=ModelFitResponse)
@legacy_modeling_router.post("/fit", response_model=ModelFitResponse)
def fit_model(
    dataset_id: str = Path(..., description="Unique dataset identifier"),
    request: ModelFitRequest = ...
):
    """Step 11: Train model on isolated X_train / y_train partition."""
    return ModelingEngine.fit_model(dataset_id, request)


@router.post("/predict", response_model=ModelPredictResponse)
@legacy_modeling_router.post("/predict", response_model=ModelPredictResponse)
def predict_model(
    dataset_id: str = Path(..., description="Unique dataset identifier"),
    request: Optional[ModelPredictRequest] = None
):
    """Step 12: Generate predictions y_pred using test set X_test."""
    req = request or ModelPredictRequest()
    return ModelingEngine.predict(dataset_id, req)


@router.post("/predict-single", response_model=SinglePredictResponse)
@legacy_modeling_router.post("/predict-single", response_model=SinglePredictResponse)
def predict_single(
    dataset_id: str = Path(..., description="Unique dataset identifier"),
    request: SinglePredictRequest = ...
):
    """Step 12: Generate real-time prediction for a custom feature sample (What-If simulator)."""
    return ModelingEngine.predict_single(dataset_id, request)


@router.get("/original-schema", response_model=OriginalSchemaResponse)
@legacy_modeling_router.get("/original-schema", response_model=OriginalSchemaResponse)
def get_original_schema(
    dataset_id: str = Path(..., description="Unique dataset identifier"),
    model_id: Optional[str] = None
):
    """Step 12: Retrieve untouched original input schema, categories, and dataset sample rows for live human prediction."""
    return ModelingEngine.get_original_schema(dataset_id, model_id)


@router.post("/predict-live", response_model=LivePredictResponse)
@legacy_modeling_router.post("/predict-live", response_model=LivePredictResponse)
def predict_live(
    dataset_id: str = Path(..., description="Unique dataset identifier"),
    request: LivePredictRequest = ...
):
    """Step 12: Execute real-time live prediction with original raw feature values (e.g. raw categories & unscaled numbers)."""
    return ModelingEngine.predict_live(dataset_id, request)


@router.get("/sample-instance", response_model=SampleInstanceResponse)
@legacy_modeling_router.get("/sample-instance", response_model=SampleInstanceResponse)
def get_sample_instance(
    dataset_id: str = Path(..., description="Unique dataset identifier"),
    model_id: Optional[str] = None
):
    """Step 12: Retrieve feature statistics and default test sample values for the What-If simulator."""
    return ModelingEngine.get_sample_instance(dataset_id, model_id)


@router.post("/predict-batch", response_model=BatchNewPredictResponse)
@legacy_modeling_router.post("/predict-batch", response_model=BatchNewPredictResponse)
def predict_batch_records(
    dataset_id: str = Path(..., description="Unique dataset identifier"),
    request: BatchNewPredictRequest = ...
):
    """Step 12: Predict multiple new unlabelled records using the trained model."""
    return ModelingEngine.predict_batch_new(dataset_id, request.records, request.model_id)


@router.post("/predict-file", response_model=BatchNewPredictResponse)
@legacy_modeling_router.post("/predict-file", response_model=BatchNewPredictResponse)
async def predict_file(
    dataset_id: str = Path(..., description="Unique dataset identifier"),
    file: UploadFile = File(..., description="Unlabelled dataset file (.csv, .xlsx, .json) to predict on"),
    model_id: Optional[str] = Form(None, description="Optional model ID to use for inference")
):
    """Step 12: Upload a new dataset file and execute batch predictions using the trained model."""
    content = await file.read()
    return ModelingEngine.predict_batch_file(dataset_id, content, file.filename or "data.csv", model_id)


@router.get("/predict-template", response_model=PredictTemplateResponse)
@legacy_modeling_router.get("/predict-template", response_model=PredictTemplateResponse)
def get_prediction_template(
    dataset_id: str = Path(..., description="Unique dataset identifier"),
    model_id: Optional[str] = None
):
    """Step 12: Get empty prediction CSV template and sample rows for new unseen data inference."""
    return ModelingEngine.get_prediction_template(dataset_id, model_id)


@router.get("/download-predictions")
@legacy_modeling_router.get("/download-predictions")
def download_predictions_csv(
    dataset_id: str = Path(..., description="Unique dataset identifier")
):
    """Step 12: Download enriched batch prediction results as a CSV file."""
    file_path, filename = ModelingEngine.get_predictions_file_path(dataset_id)
    return FileResponse(
        path=str(file_path),
        filename=filename,
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )


@router.post("/evaluate", response_model=EvaluationResponse)
@router.get("/evaluate", response_model=EvaluationResponse)
@legacy_modeling_router.post("/evaluate", response_model=EvaluationResponse)
@legacy_modeling_router.get("/evaluate", response_model=EvaluationResponse)
def evaluate_model(
    dataset_id: str = Path(..., description="Unique dataset identifier"),
    request: Optional[EvaluationRequest] = None
):
    """Step 13: Evaluate test predictions against ground truth y_test."""
    req = request or EvaluationRequest()
    return ModelingEngine.evaluate(dataset_id, req)


@router.get("/models")
@legacy_modeling_router.get("/models")
def list_fitted_models(
    dataset_id: str = Path(..., description="Unique dataset identifier")
):
    """List all fitted models and metrics for comparative analysis."""
    return ModelingEngine.list_models(dataset_id)


@router.post("/models/{model_id}/activate")
@legacy_modeling_router.post("/models/{model_id}/activate")
def activate_model(
    dataset_id: str = Path(..., description="Unique dataset identifier"),
    model_id: str = Path(..., description="Unique model ID to activate")
):
    """Activate a specific fitted model for inference and evaluation."""
    return ModelingEngine.activate_model(dataset_id, model_id)


@router.get("/download")
@router.get("/download-model")
@legacy_modeling_router.get("/download")
@legacy_modeling_router.get("/download-model")
def download_model(
    dataset_id: str = Path(..., description="Unique dataset identifier"),
    model_id: Optional[str] = None
):
    """Download the active or specified trained model as a serialized pickle (.pkl) file."""
    file_path, filename = ModelingEngine.get_model_file_path(dataset_id, model_id)
    return FileResponse(
        path=str(file_path),
        filename=filename,
        media_type="application/octet-stream",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )


@router.get("/models/{model_id}/download")
@legacy_modeling_router.get("/models/{model_id}/download")
def download_specific_model(
    dataset_id: str = Path(..., description="Unique dataset identifier"),
    model_id: str = Path(..., description="Unique model ID to download")
):
    """Download a specific trained model as a serialized pickle (.pkl) file."""
    file_path, filename = ModelingEngine.get_model_file_path(dataset_id, model_id)
    return FileResponse(
        path=str(file_path),
        filename=filename,
        media_type="application/octet-stream",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )



