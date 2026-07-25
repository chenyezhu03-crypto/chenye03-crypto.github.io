"""HTTP client with polite rate limiting."""

from __future__ import annotations

import time
from typing import Any

import requests


DEFAULT_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (compatible; ShsfkyyAppointmentResearchBot/0.1; "
        "+https://github.com/chenyezhu03-crypto/chenye03-crypto.github.io) "
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept": "application/json, text/html, */*",
    "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
}


class PoliteClient:
    """Simple requests wrapper with delay between calls."""

    def __init__(self, delay: float = 0.8, timeout: float = 20.0) -> None:
        self.delay = delay
        self.timeout = timeout
        self.session = requests.Session()
        self.session.headers.update(DEFAULT_HEADERS)
        self._last_request_at = 0.0

    def _wait(self) -> None:
        elapsed = time.monotonic() - self._last_request_at
        if elapsed < self.delay:
            time.sleep(self.delay - elapsed)

    def get(self, url: str, **kwargs: Any) -> requests.Response:
        self._wait()
        kwargs.setdefault("timeout", self.timeout)
        response = self.session.get(url, **kwargs)
        self._last_request_at = time.monotonic()
        return response

    def post_json(self, url: str, payload: dict[str, Any], **kwargs: Any) -> requests.Response:
        self._wait()
        headers = kwargs.pop("headers", {})
        merged = {
            "Content-Type": "application/json;charset=UTF-8",
            "Origin": "https://www.youlai.cn",
            "X-Requested-With": "XMLHttpRequest",
            **headers,
        }
        kwargs.setdefault("timeout", self.timeout)
        response = self.session.post(url, json=payload, headers=merged, **kwargs)
        self._last_request_at = time.monotonic()
        return response
