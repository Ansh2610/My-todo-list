def calc_metrics(elapsed: float, confidences: list[float]) -> dict:
    """
    Calculate inference metrics.
    
    - FPS: 1 / elapsed time
    - Avg confidence: mean of all box confidences
    - False positive rate: % boxes below 0.5 conf (rough proxy)
    """
    
    fps = 1.0 / elapsed if elapsed > 0 else 0.0
    
    if not confidences:
        return {
            "fps": fps,
            "avg_confidence": 0.0,
            "false_positive_rate": 0.0,
            "box_count": 0
        }
    
    avg_conf = sum(confidences) / len(confidences)
    low_conf_count = sum(1 for c in confidences if c < 0.5)
    fp_rate = (low_conf_count / len(confidences)) * 100
    
    return {
        "fps": round(fps, 2),
        "avg_confidence": round(avg_conf, 3),
        "false_positive_rate": round(fp_rate, 1),
        "box_count": len(confidences)
    }
