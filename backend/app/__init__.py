"""DataMentor AI Backend Application Package."""
from pathlib import Path

__version__ = "0.1.0"

# Extend app namespace to include datamentor engines package for seamless subpackage discovery
_pkg_dir = Path(__file__).resolve().parent
_datamentor_dir = _pkg_dir / "engines" / "datamentor"
if _datamentor_dir.exists() and str(_datamentor_dir) not in __path__:
    __path__.append(str(_datamentor_dir))
