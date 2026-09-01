package com.bulkfit.exception;

/**
 * Thrown when the Gemini API call fails, times out, returns malformed JSON,
 * or the app is missing a configured API key. Handled distinctly from the
 * existing domain exceptions so AI failures surface a clear, dedicated message.
 */
public class AiServiceException extends RuntimeException {
    public AiServiceException(String message) {
        super(message);
    }

    public AiServiceException(String message, Throwable cause) {
        super(message, cause);
    }
}
