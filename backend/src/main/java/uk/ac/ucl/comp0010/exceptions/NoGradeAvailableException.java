package uk.ac.ucl.comp0010.exceptions;

/**
 * Custom exception thrown when a grade is unavailable for a specified query.
 * This exception extends {@link RuntimeException} and is used to indicate that no grade data is
 * available for the requested operation.
 */
public class NoGradeAvailableException extends RuntimeException {
  /**
   * Constructs a new {@code NoGradeAvailableException} with the specified detail message.
   *
   * @param message the detail message explaining the cause of the exception.
   */
  public NoGradeAvailableException(String message) {
    super(message);
  }
}
