import time
import asyncio
from typing import Callable, Any, Optional, Dict
from enum import Enum
import logging

logger = logging.getLogger("circuit_breaker")

class CircuitState(str, Enum):
    CLOSED = "CLOSED"       # Normal operation (requests go through)
    OPEN = "OPEN"           # Tripped (fail-fast without calling external service)
    HALF_OPEN = "HALF_OPEN" # Probing service recovery

class CircuitBreakerOpenException(Exception):
    """Raised when a request is rejected because the circuit breaker is OPEN."""
    pass

class CircuitBreaker:
    """
    Enterprise Circuit Breaker for External APIs (MFAPI, CoinGecko, RSS News Scraper).
    
    Prevents cascading timeouts and thread exhaustion by failing fast (<1ms)
    when external services degrade or hit rate limits.
    """
    def __init__(
        self,
        name: str,
        failure_threshold: int = 3,
        recovery_timeout: float = 30.0,
        expected_exceptions: tuple = (Exception,)
    ):
        self.name = name
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.expected_exceptions = expected_exceptions
        
        self.state: CircuitState = CircuitState.CLOSED
        self.failure_count: int = 0
        self.last_state_change: float = time.time()
        self.last_failure_time: float = 0.0
        self._lock = asyncio.Lock()

    def get_status(self) -> Dict[str, Any]:
        return {
            "name": self.name,
            "state": self.state.value,
            "failure_count": self.failure_count,
            "last_failure_ago_secs": round(time.time() - self.last_failure_time, 1) if self.last_failure_time else None
        }

    async def __call__(self, func: Callable, *args, fallback: Optional[Callable] = None, **kwargs) -> Any:
        async with self._lock:
            # Check if OPEN circuit should transition to HALF_OPEN
            if self.state == CircuitState.OPEN:
                if time.time() - self.last_state_change >= self.recovery_timeout:
                    self.state = CircuitState.HALF_OPEN
                    self.last_state_change = time.time()
                    logger.info(f"CircuitBreaker[{self.name}] entered HALF_OPEN state; probing downstream.")
                else:
                    logger.warning(f"CircuitBreaker[{self.name}] is OPEN. Fast-failing downstream call.")
                    if fallback:
                        return await fallback(*args, **kwargs) if asyncio.iscoroutinefunction(fallback) else fallback(*args, **kwargs)
                    raise CircuitBreakerOpenException(f"Service {self.name} is currently unavailable (circuit open).")

        # Execute call
        try:
            if asyncio.iscoroutinefunction(func):
                result = await func(*args, **kwargs)
            else:
                result = func(*args, **kwargs)
                
            # Success in CLOSED or HALF_OPEN
            async with self._lock:
                if self.state == CircuitState.HALF_OPEN:
                    self.state = CircuitState.CLOSED
                    self.failure_count = 0
                    self.last_state_change = time.time()
                    logger.info(f"CircuitBreaker[{self.name}] recovered! Returned to CLOSED state.")
                elif self.state == CircuitState.CLOSED:
                    self.failure_count = 0
                    
            return result
        except self.expected_exceptions as exc:
            async with self._lock:
                self.failure_count += 1
                self.last_failure_time = time.time()
                logger.error(f"CircuitBreaker[{self.name}] recorded failure ({self.failure_count}/{self.failure_threshold}): {exc}")
                
                if self.failure_count >= self.failure_threshold or self.state == CircuitState.HALF_OPEN:
                    self.state = CircuitState.OPEN
                    self.last_state_change = time.time()
                    logger.error(f"CircuitBreaker[{self.name}] TRIPPED OPEN. Downstream calls will fail-fast for {self.recovery_timeout}s.")
            
            if fallback:
                return await fallback(*args, **kwargs) if asyncio.iscoroutinefunction(fallback) else fallback(*args, **kwargs)
            raise

# Pre-instantiated circuit breakers for core services
coingecko_breaker = CircuitBreaker("CoinGecko_API", failure_threshold=3, recovery_timeout=20.0)
mfapi_breaker = CircuitBreaker("MFAPI_India", failure_threshold=3, recovery_timeout=20.0)
news_breaker = CircuitBreaker("FinancialNews_Scraper", failure_threshold=2, recovery_timeout=15.0)
