package uk.ac.ucl.comp0010.exceptions;

/**
 * Custom exception thrown when a registration is not found or available for a specified query.
 * This exception extends {@link RuntimeException} and is used to signal that a registration could
 * not be found or retrieved for the requested operation.
 */
public class NoRegistrationException extends RuntimeException {
  /**
   * Constructs a new {@code NoRegistrationException} with the specified detail message.
   *
   * @param message the detail message explaining the cause of the exception.
   */
  public NoRegistrationException(String message) {
    super(message);
  }
}
