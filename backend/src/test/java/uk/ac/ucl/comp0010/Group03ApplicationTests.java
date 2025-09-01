package uk.ac.ucl.comp0010;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

/**
 * Unit test class for testing the main application context and main method of the
 * {@link Group03Application} class.
 * <p>
 * This test ensures that the application context loads successfully and verifies that the main
 * method executes without throwing exceptions. It is primarily a sanity check to confirm that the
 * application starts properly within a Spring Boot environment.
 * </p>
 */
@SpringBootTest(useMainMethod = SpringBootTest.UseMainMethod.ALWAYS)
class Group03ApplicationTests {

  /**
   * Tests whether the Spring application context loads successfully.
   * <p>
   * This test ensures that all Spring components are properly initialized and that there are no
   * issues with configuration.
   * </p>
   */
  @Test
  void contextLoads() {
  }

  /**
   * Tests the main method of the {@link Group03Application} class.
   * <p>
   * This test verifies that the main method executes without throwing exceptions.
   * </p>
   */
  @Test
  void main() {
  }

}
