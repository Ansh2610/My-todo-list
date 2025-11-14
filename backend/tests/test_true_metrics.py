"""
Unit tests for true metrics calculation.

Tests precision, recall, F1 score, true FP rate.
"""
import pytest
from datetime import datetime
from app.schemas.validation import GroundTruthBox, TrueMetrics
from app.utils.true_metrics import calculate_true_metrics, update_box_validation


class TestTrueMetrics:
    """Test true metrics calculation"""
    
    def test_no_verified_boxes(self):
        """Should return zero metrics when no boxes verified"""
        boxes = [
            GroundTruthBox(
                x1=10, y1=10, x2=50, y2=50,
                confidence=0.9, label="person", class_id=0,
                is_verified=False
            )
        ]
        yolo_metrics = {"fps": 10.0, "avg_confidence": 0.9, "box_count": 1}
        
        metrics = calculate_true_metrics(boxes, yolo_metrics)
        
        assert metrics.true_positives == 0
        assert metrics.false_positives == 0
        assert metrics.precision == 0.0
        assert metrics.recall == 0.0
        assert metrics.f1_score == 0.0
        assert metrics.false_positive_rate == 0.0
    
    def test_all_true_positives(self):
        """Should calculate perfect metrics when all correct"""
        boxes = [
            GroundTruthBox(
                x1=10, y1=10, x2=50, y2=50,
                confidence=0.9, label="person", class_id=0,
                is_verified=True, is_correct=True
            ),
            GroundTruthBox(
                x1=60, y1=60, x2=100, y2=100,
                confidence=0.85, label="car", class_id=2,
                is_verified=True, is_correct=True
            )
        ]
        yolo_metrics = {"fps": 10.0, "avg_confidence": 0.875, "box_count": 2}
        
        metrics = calculate_true_metrics(boxes, yolo_metrics)
        
        assert metrics.true_positives == 2
        assert metrics.false_positives == 0
        assert metrics.precision == 1.0
        assert metrics.recall == 1.0
        assert metrics.f1_score == 1.0
        assert metrics.false_positive_rate == 0.0
    
    def test_all_false_positives(self):
        """Should calculate zero precision when all incorrect"""
        boxes = [
            GroundTruthBox(
                x1=10, y1=10, x2=50, y2=50,
                confidence=0.4, label="person", class_id=0,
                is_verified=True, is_correct=False
            ),
            GroundTruthBox(
                x1=60, y1=60, x2=100, y2=100,
                confidence=0.3, label="car", class_id=2,
                is_verified=True, is_correct=False
            )
        ]
        yolo_metrics = {"fps": 10.0, "avg_confidence": 0.35, "box_count": 2}
        
        metrics = calculate_true_metrics(boxes, yolo_metrics)
        
        assert metrics.true_positives == 0
        assert metrics.false_positives == 2
        assert metrics.precision == 0.0
        assert metrics.recall == 0.0
        assert metrics.f1_score == 0.0
        assert metrics.false_positive_rate == 100.0
    
    def test_mixed_results(self):
        """Should calculate correct metrics with mix of TP and FP"""
        boxes = [
            GroundTruthBox(
                x1=10, y1=10, x2=50, y2=50,
                confidence=0.9, label="person", class_id=0,
                is_verified=True, is_correct=True  # TP
            ),
            GroundTruthBox(
                x1=60, y1=60, x2=100, y2=100,
                confidence=0.4, label="car", class_id=2,
                is_verified=True, is_correct=False  # FP
            ),
            GroundTruthBox(
                x1=120, y1=120, x2=150, y2=150,
                confidence=0.85, label="dog", class_id=16,
                is_verified=True, is_correct=True  # TP
            )
        ]
        yolo_metrics = {"fps": 10.0, "avg_confidence": 0.717, "box_count": 3}
        
        metrics = calculate_true_metrics(boxes, yolo_metrics)
        
        assert metrics.true_positives == 2
        assert metrics.false_positives == 1
        assert metrics.precision == pytest.approx(0.667, abs=0.01)  # 2/(2+1)
        assert metrics.recall == 1.0  # 2/(2+0)  (no FN yet)
        assert metrics.f1_score == pytest.approx(0.800, abs=0.01)  # 2*0.667*1 / (0.667+1)
        assert metrics.false_positive_rate == pytest.approx(33.3, abs=0.1)  # 1/3 * 100
    
    def test_partial_verification(self):
        """Should only count verified boxes in metrics"""
        boxes = [
            GroundTruthBox(
                x1=10, y1=10, x2=50, y2=50,
                confidence=0.9, label="person", class_id=0,
                is_verified=True, is_correct=True  # TP (counted)
            ),
            GroundTruthBox(
                x1=60, y1=60, x2=100, y2=100,
                confidence=0.4, label="car", class_id=2,
                is_verified=False  # Not verified (NOT counted)
            )
        ]
        yolo_metrics = {"fps": 10.0, "avg_confidence": 0.65, "box_count": 2}
        
        metrics = calculate_true_metrics(boxes, yolo_metrics)
        
        assert metrics.total_verified == 1
        assert metrics.true_positives == 1
        assert metrics.false_positives == 0
        assert metrics.precision == 1.0
        assert metrics.false_positive_rate == 0.0


class TestBoxValidation:
    """Test box validation update"""
    
    def test_update_box_validation(self):
        """Should update box verification status"""
        boxes = [
            GroundTruthBox(
                x1=10, y1=10, x2=50, y2=50,
                confidence=0.9, label="person", class_id=0
            )
        ]
        
        box_id = "session123_0"
        updated_box = update_box_validation(
            boxes=boxes,
            box_id=box_id,
            is_correct=False,
            notes="Wrong detection"
        )
        
        assert updated_box.is_verified == True
        assert updated_box.is_correct == False
        assert updated_box.notes == "Wrong detection"
        assert updated_box.verified_at is not None
    
    def test_update_with_confidence_override(self):
        """Should allow confidence override"""
        boxes = [
            GroundTruthBox(
                x1=10, y1=10, x2=50, y2=50,
                confidence=0.9, label="person", class_id=0
            )
        ]
        
        box_id = "session123_0"
        updated_box = update_box_validation(
            boxes=boxes,
            box_id=box_id,
            is_correct=True,
            confidence_override=0.95
        )
        
        assert updated_box.confidence == 0.95
    
    def test_invalid_box_id(self):
        """Should raise error for invalid box ID"""
        boxes = [
            GroundTruthBox(
                x1=10, y1=10, x2=50, y2=50,
                confidence=0.9, label="person", class_id=0
            )
        ]
        
        with pytest.raises(ValueError, match="Invalid box_id"):
            update_box_validation(
                boxes=boxes,
                box_id="invalid_id",
                is_correct=True
            )
    
    def test_out_of_range_box_id(self):
        """Should raise error for out of range index"""
        boxes = [
            GroundTruthBox(
                x1=10, y1=10, x2=50, y2=50,
                confidence=0.9, label="person", class_id=0
            )
        ]
        
        with pytest.raises(ValueError, match="Invalid box_id"):
            update_box_validation(
                boxes=boxes,
                box_id="session123_999",
                is_correct=True
            )


class TestMetricsEdgeCases:
    """Test edge cases and error handling"""
    
    def test_empty_boxes_list(self):
        """Should handle empty boxes list"""
        boxes = []
        yolo_metrics = {"fps": 10.0, "avg_confidence": 0.0, "box_count": 0}
        
        metrics = calculate_true_metrics(boxes, yolo_metrics)
        
        assert metrics.true_positives == 0
        assert metrics.false_positives == 0
        assert metrics.total_verified == 0
    
    def test_preserve_yolo_metrics(self):
        """Should preserve original YOLO metrics"""
        boxes = [
            GroundTruthBox(
                x1=10, y1=10, x2=50, y2=50,
                confidence=0.9, label="person", class_id=0,
                is_verified=True, is_correct=True
            )
        ]
        yolo_metrics = {
            "fps": 14.5,
            "avg_confidence": 0.875,
            "box_count": 5
        }
        
        metrics = calculate_true_metrics(boxes, yolo_metrics)
        
        assert metrics.yolo_fps == 14.5
        assert metrics.yolo_avg_confidence == 0.875
        assert metrics.yolo_box_count == 5


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
