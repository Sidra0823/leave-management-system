from datetime import date, timedelta

def daterange_days(start: date, end: date) -> int:
    # inclusive of both start and end
    return (end - start).days + 1

def dates_overlap(a_start, a_end, b_start, b_end) -> bool:
    return not (a_end < b_start or b_end < a_start)
