from app.utils.metrics import calc_metrics

def test_metrics_no_boxes():
    """Metrics with no detections"""
    result = calc_metrics(0.5, [])
    assert result["fps"] == 2.0
    assert result["avg_confidence"] == 0.0
    assert result["false_positive_rate"] == 0.0
    assert result["box_count"] == 0

def test_metrics_high_confidence():
    """All boxes high confidence"""
    result = calc_metrics(0.1, [0.9, 0.85, 0.92])
    assert result["fps"] == 10.0
    assert result["avg_confidence"] > 0.85
    assert result["false_positive_rate"] == 0.0
    assert result["box_count"] == 3

def test_metrics_low_confidence():
    """Some low conf boxes (false positives)"""
    result = calc_metrics(0.2, [0.8, 0.3, 0.4, 0.9])
    assert result["fps"] == 5.0
    assert result["false_positive_rate"] == 50.0  # 2 out of 4 < 0.5
    assert result["box_count"] == 4
