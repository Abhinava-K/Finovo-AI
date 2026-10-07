import time
from collections import defaultdict
from fastapi import Request, HTTPException, status
from typing import Dict, List
import asyncio

class SlidingWindowRateLimiter:
    """
    High-Performance In-Memory Sliding Window IP Rate Limiter.
    Protects LLM API billing quotas and prevents client DDoS/abuse.
    """

    def __init__(self, max_requests: int = 10, window_seconds: int = 60):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.request_history: Dict[str, List[float]] = defaultdict(list)
        self._lock = asyncio.Lock()

    def _get_client_ip(self, request: Request) -> str:
        """Extracts client IP from X-Forwarded-For header or direct client connection."""
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            return forwarded.split(",")[0].strip()
        if request.client and request.client.host:
            return request.client.host
        return "127.0.0.1"

    async def check_rate_limit(self, request: Request):
        """
        Checks if the client IP has exceeded the allowed request quota.
        Raises HTTP 429 if the quota is exceeded within the sliding window.
        """
        client_ip = self._get_client_ip(request)
        current_time = time.time()
        window_start = current_time - self.window_seconds

        async with self._lock:
            # Filter timestamps within the current sliding window
            valid_timestamps = [t for t in self.request_history[client_ip] if t > window_start]
            
            if len(valid_timestamps) >= self.max_requests:
                retry_after = int(self.window_seconds - (current_time - valid_timestamps[0])) + 1
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail={
                        "error": "Rate limit exceeded",
                        "message": f"Maximum of {self.max_requests} requests per {self.window_seconds}s allowed. Please wait before retrying.",
                        "retry_after_seconds": max(1, retry_after)
                    },
                    headers={"Retry-After": str(max(1, retry_after))}
                )

            # Record this request timestamp
            valid_timestamps.append(current_time)
            self.request_history[client_ip] = valid_timestamps

# Pre-configured Rate Limiter Instances
agent_chat_limiter = SlidingWindowRateLimiter(max_requests=10, window_seconds=60) # 10 requests / min for LLM chat
portfolio_limiter = SlidingWindowRateLimiter(max_requests=30, window_seconds=60)  # 30 requests / min for deterministic math
