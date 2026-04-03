"""
Runtime logging configuration for local backend monitoring.
Creates plain-text or structured-JSON log files for general runtime events and trigger-cycle summaries.
Structured logging is enabled by setting STRUCTURED_LOGGING=true in the environment.
"""

from __future__ import annotations

import json
import logging
import os
from datetime import datetime, timezone
from pathlib import Path


class PrefixFilter(logging.Filter):
    def __init__(self, prefixes: tuple[str, ...]):
        super().__init__()
        self.prefixes = prefixes

    def filter(self, record: logging.LogRecord) -> bool:
        return any(record.name.startswith(prefix) for prefix in self.prefixes)


class StructuredFormatter(logging.Formatter):
    def __init__(self):
        super().__init__(fmt=None, datefmt=None)

    def format(self, record: logging.LogRecord) -> str:
        ts = datetime.fromtimestamp(record.created, tz=timezone.utc).isoformat()
        fields = {
            "ts": ts,
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }
        if record.exc_info:
            fields["exception"] = self.formatException(record.exc_info)
        extra = {
            k: v for k, v in record.__dict__.items()
            if k not in {"name", "msg", "args", "created", "filename", "funcName",
                         "levelname", "lineno", "module", "msecs", "message",
                         "pathname", "process", "processName", "relativeCreated",
                         "stack_info", "exc_info", "exc_text", "thread", "threadName",
                         "message", "levelname", "name"}
            and not k.startswith("_")
        }
        if extra:
            fields["extra"] = extra
        return json.dumps(fields, default=str)


def configure_logging() -> None:
    root = logging.getLogger()
    if getattr(root, "_rideshield_logging_configured", False):
        return

    structured = os.environ.get("STRUCTURED_LOGGING", "").lower() in ("1", "true", "yes")

    log_dir = Path("logs") / "runtime"
    log_dir.mkdir(parents=True, exist_ok=True)

    if structured:
        formatter = StructuredFormatter()
    else:
        formatter = logging.Formatter("%(asctime)s %(levelname)s %(name)s %(message)s")

    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)
    console_handler.setFormatter(formatter)

    app_file_handler = logging.FileHandler(log_dir / "app_runtime.txt", encoding="utf-8")
    app_file_handler.setLevel(logging.INFO)
    app_file_handler.setFormatter(formatter)

    cycle_file_handler = logging.FileHandler(log_dir / "trigger_cycles.txt", encoding="utf-8")
    cycle_file_handler.setLevel(logging.INFO)
    cycle_file_handler.setFormatter(formatter)
    cycle_file_handler.addFilter(PrefixFilter(("rideshield.scheduler", "rideshield.cycles")))

    root.setLevel(logging.INFO)
    root.handlers.clear()
    root.addHandler(console_handler)
    root.addHandler(app_file_handler)
    root.addHandler(cycle_file_handler)
    root._rideshield_logging_configured = True
