"""SRS 算法单元测试"""
from datetime import timezone
from app.services.srs import calculate_next_review, get_status_from_repetitions


class TestCalculateNextReview:
    def test_rating_1_resets_repetitions(self):
        ef, interval, reps, due = calculate_next_review(1, 2.5, 10, 5)
        assert reps == 0
        assert interval == 1

    def test_rating_2_resets_repetitions(self):
        ef, interval, reps, due = calculate_next_review(2, 2.5, 10, 5)
        assert reps == 0
        assert interval >= 1

    def test_rating_3_increments_repetitions(self):
        ef, interval, reps, due = calculate_next_review(3, 2.5, 10, 3)
        assert reps == 4
        assert interval > 0

    def test_rating_4_increments_with_bonus(self):
        ef, interval, reps, due = calculate_next_review(4, 2.5, 10, 3)
        assert reps == 4
        ef3, interval3, _, _ = calculate_next_review(3, 2.5, 10, 3)
        assert interval > interval3

    def test_first_repetition_interval_is_1(self):
        ef, interval, reps, due = calculate_next_review(3, 2.5, 0, 0)
        assert reps == 1
        assert interval == 1

    def test_second_repetition_interval_is_6(self):
        ef, interval, reps, due = calculate_next_review(3, 2.5, 1, 1)
        assert reps == 2
        assert interval == 6

    def test_ease_factor_never_below_minimum(self):
        ef, _, _, _ = calculate_next_review(1, 1.3, 1, 0)
        assert ef >= 1.3

    def test_due_date_is_timezone_aware(self):
        _, _, _, due = calculate_next_review(3, 2.5, 1, 1)
        assert due.tzinfo is not None

    def test_ease_factor_stable_on_easy(self):
        ef, _, _, _ = calculate_next_review(4, 2.5, 10, 5)
        assert ef == 2.5

    def test_ease_factor_decreases_on_hard(self):
        ef, _, _, _ = calculate_next_review(1, 2.5, 10, 5)
        assert ef < 2.5


class TestGetStatusFromRepetitions:
    def test_new(self):
        assert get_status_from_repetitions(0, 3) == "new"

    def test_learning(self):
        assert get_status_from_repetitions(1, 3) == "learning"
        assert get_status_from_repetitions(2, 3) == "learning"

    def test_learning_on_bad_rating(self):
        assert get_status_from_repetitions(4, 2) == "learning"

    def test_review(self):
        assert get_status_from_repetitions(3, 3) == "review"
        assert get_status_from_repetitions(4, 3) == "review"

    def test_mastered(self):
        assert get_status_from_repetitions(5, 3) == "mastered"
        assert get_status_from_repetitions(10, 4) == "mastered"
