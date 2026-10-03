from fastapi import APIRouter, Path
from app.split.models import TrainTestSplitRequest, TrainTestSplitResponse, SplitSummaryResponse
from app.split.split_engine import SplitEngine

router = APIRouter(prefix="/datasets/{dataset_id}/split", tags=["split"])
legacy_split_router = APIRouter(prefix="/split", tags=["split"])


@router.get("/summary", response_model=SplitSummaryResponse)
@router.get("", response_model=SplitSummaryResponse)
def get_split_summary(
    dataset_id: str = Path(..., description="Unique dataset identifier")
):
    """Retrieve split readiness metrics, candidate target columns, and recommended ratios."""
    return SplitEngine.get_summary(dataset_id)


@router.post("", response_model=TrainTestSplitResponse)
@legacy_split_router.post("/{dataset_id}", response_model=TrainTestSplitResponse)
def execute_train_test_split(
    dataset_id: str = Path(..., description="Unique dataset identifier"),
    request: TrainTestSplitRequest = ...
):
    """Partition dataset into training and testing sets with data leakage prevention."""
    return SplitEngine.execute_split(dataset_id, request)

