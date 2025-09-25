from __future__ import annotations

from random import choice

SIMULATED_RECOMMENDATIONS = [
    "Activa copilotos para mitigar riesgos regulatorios en LATAM",
    "Sincroniza datos meteorológicos para anticipar disrupciones logísticas",
    "Refuerza la postura de ciberseguridad con auto-hardening en entornos edge",
]


def generate_recommendation() -> str:
    """Retorna una recomendación de IA simulada."""

    return choice(SIMULATED_RECOMMENDATIONS)
