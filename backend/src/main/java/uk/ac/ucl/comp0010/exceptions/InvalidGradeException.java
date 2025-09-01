package uk.ac.ucl.comp0010.exceptions;

/**
 * Custom exception to indicate invalid grade-related operations. This exception is thrown when a
 * grade-related operation is performed with invalid data, such as an out-of-range grade value
 * (e.g., a score below 0 or above 100).
 */
public class InvalidGradeException extends RuntimeException {
  /**
   * Constructs a new InvalidGradeException with the specified detail message.
   *
   * @param message the detail message providing information about the invalid grade issue
   */
  public InvalidGradeException(String message) {
    super(message);
  }
}
