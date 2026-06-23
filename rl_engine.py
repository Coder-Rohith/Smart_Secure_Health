"""
Reinforcement Learning Recommendation Engine.
Uses epsilon-greedy multi-armed bandit approach to dynamically rank
treatment recommendations based on accumulated user feedback.
"""

import random
from collections import defaultdict


class RLRecommendationEngine:
    """
    Epsilon-greedy RL engine for treatment recommendations.
    
    - Stores Q-values (success rates) for each disease-treatment pair
    - Uses exploration (random) vs exploitation (best-known) strategy
    - Epsilon decays over time as more feedback is collected
    """

    def __init__(self):
        self.epsilon = 0.2  # Initial exploration rate (20%)
        self.min_epsilon = 0.05  # Minimum exploration rate
        self.decay_rate = 0.995  # Epsilon decay per feedback

        # Treatment options per disease category
        self.treatments = {
            "Heart Disease": [
                "Consult a cardiologist immediately",
                "Start a low-sodium, heart-healthy diet (DASH diet)",
                "Begin supervised cardiovascular exercise program",
                "Cholesterol-lowering medication (Statins) — consult doctor",
                "Monitor blood pressure twice daily",
                "Enroll in a cardiac rehabilitation program",
                "Low-dose aspirin therapy (under medical supervision)",
                "Stress management: meditation and deep breathing",
                "Limit alcohol intake and quit smoking",
                "Regular ECG and blood panel monitoring",
            ],
            "No Disease": [
                "Maintain a balanced, nutrient-rich diet",
                "Regular cardiovascular exercise (30 min/day, 5 days/week)",
                "Schedule annual comprehensive health check-up",
                "Practice stress management techniques (yoga, meditation)",
                "Ensure adequate sleep (7–8 hours per night)",
                "Stay hydrated (8+ glasses of water per day)",
                "Limit processed food and sugar intake",
                "Maintain healthy BMI through diet and exercise",
            ],
        }

        # Q-values: {disease: {treatment: [total_reward, count]}}
        self.q_values = defaultdict(lambda: defaultdict(lambda: [0.0, 0]))

    def get_recommendations(self, disease: str, top_k: int = 4) -> list:
        """
        Get top-k treatment recommendations for a disease.
        Uses epsilon-greedy strategy to balance exploration and exploitation.
        """
        treatments = self.treatments.get(disease, ["Consult a healthcare specialist"])

        if random.random() < self.epsilon:
            # EXPLORATION: random selection to discover new effective treatments
            selected = random.sample(treatments, min(top_k, len(treatments)))
        else:
            # EXPLOITATION: select treatments with highest known success rates
            scored = []
            for t in treatments:
                total_reward, count = self.q_values[disease][t]
                # Optimistic initial value (0.5) for unexplored treatments
                score = total_reward / count if count > 0 else 0.5
                scored.append((t, score, count))

            # Sort by score descending, break ties by preferring less-explored
            scored.sort(key=lambda x: (x[1], -x[2]), reverse=True)
            selected = [t for t, _, _ in scored[:top_k]]

        return selected

    def update(self, disease: str, treatment: str, reward: int):
        """
        Update Q-values based on user feedback.
        reward: 1 for successful/helpful, 0 for not helpful.
        """
        self.q_values[disease][treatment][0] += reward
        self.q_values[disease][treatment][1] += 1

        # Decay epsilon (reduce exploration over time)
        self.epsilon = max(self.min_epsilon, self.epsilon * self.decay_rate)

    def get_stats(self) -> dict:
        """Get current RL engine statistics for analytics."""
        stats = {}
        for disease in self.q_values:
            stats[disease] = {}
            for treatment in self.q_values[disease]:
                total, count = self.q_values[disease][treatment]
                stats[disease][treatment] = {
                    "success_rate": round(total / count * 100, 1) if count > 0 else 0,
                    "total_feedback": count,
                }
        return stats

    def get_exploration_rate(self) -> float:
        """Get current exploration rate."""
        return round(self.epsilon, 4)


# Global singleton instance
rl_engine = RLRecommendationEngine()
