package uk.ac.ucl.comp0010;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import uk.ac.ucl.comp0010.exceptions.NoGradeAvailableException;
import uk.ac.ucl.comp0010.exceptions.NoRegistrationException;


/**
 * Unit test class for testing custom exception classes.
 * <p>
 * This class verifies that custom exception classes in the project, specifically
 * {@link NoGradeAvailableException} and {@link NoRegistrationException}, behave as expected. The
 * tests check if these exceptions are initialized with the correct messages and if their
 * `getMessage` method returns the expected string values.
 * </p>
 */
@DataJpaTest
public class ExceptionTests {

  /**
   * Default constructor for ExceptionTests.
   */
  public ExceptionTests() {
  }


  /**
   * Tests the functionality of the {@link NoGradeAvailableException}.
   * <p>
   * Verifies that: 1. The exception is initialized with the correct message. 2. The `getMessage()`
   * method returns the expected string.
   * </p>
   */
  @Test
  public void testNoGradeAvailableException() {
    NoGradeAvailableException noGradeAvailableException =
        new NoGradeAvailableException("No grade available");
    assertEquals("No grade available", noGradeAvailableException.getMessage());
  }

  /**
   * Tests the functionality of the {@link NoRegistrationException}.
   * <p>
   * Verifies that: 1. The exception is initialized with the correct message. 2. The `getMessage()`
   * method returns the expected string.
   * </p>
   */
  @Test
  public void testNoRegistrationException() {
    NoRegistrationException noRegistrationException =
        new NoRegistrationException("No registration available");
    assertEquals("No registration available", noRegistrationException.getMessage());
  }

  /**
   * Tests the {@link NoGradeAvailableException} again to ensure consistency.
   * <p>
   * This test performs an additional check on the same exception class, validating: 1. The correct
   * exception message is set and returned.
   * </p>
   */
  @Test
  public void noGradeAvailableExceptionTest() {
    NoGradeAvailableException noGradeAvailableException =
        new NoGradeAvailableException("No grade available");
    assertEquals("No grade available", noGradeAvailableException.getMessage());
  }
}
