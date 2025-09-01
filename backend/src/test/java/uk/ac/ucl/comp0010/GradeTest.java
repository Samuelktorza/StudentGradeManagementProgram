package uk.ac.ucl.comp0010;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import uk.ac.ucl.comp0010.exceptions.InvalidGradeException;
import uk.ac.ucl.comp0010.grade.Grade;
import uk.ac.ucl.comp0010.grade.GradeRepository;
import uk.ac.ucl.comp0010.module.Module;
import uk.ac.ucl.comp0010.student.Student;


/**
 * Unit test class for testing the {@link Grade} entity.
 * <p>
 * This test class ensures the proper functionality of the {@link Grade} class constructors,
 * methods, and getter/setter logic. It verifies behaviors related to the grade's score boundaries,
 * handling of invalid input, null handling, string representations, and database persistence. It
 * also checks edge cases such as invalid scores and null values for the student or module.
 * </p>
 */
@DataJpaTest
public class GradeTest {

  /**
   * Default constructor for GradeTest.
   */
  public GradeTest() {
  }

  @Autowired
  private GradeRepository gradeRepository;

  private Student student;
  private Module module;
  private Grade grade;

  /**
   * Sets up the test environment before each test case.
   * <p>
   * This initializes mock instances of {@link Student} and {@link Module} objects using Mockito.
   * These mocks simulate database entities and ensure isolation between tests. It also creates a
   * {@link Grade} instance with predefined values for use in the test cases.
   * </p>
   */
  @BeforeEach
  public void setUp() {
    // Mock Student and Module
    student = Mockito.mock(Student.class);
    module = Mockito.mock(Module.class);

    // Mock methods for Student and Module
    Mockito.when(student.getId()).thenReturn(1L);
    Mockito.when(module.getCode()).thenReturn("CS101");

    // Create Grade object
    grade = new Grade(85, student, module);
  }

  /**
   * Tests the Grade constructor logic.
   * <p>
   * Verifies that the constructor correctly initializes all the fields of a Grade object, including
   * score, student, and module. Ensures no null fields are returned upon initialization.
   * </p>
   */
  @Test
  public void testGradeConstructor() {
    // Test that the constructor correctly initializes the Grade object
    assertNotNull(grade);
    assertEquals(85, grade.getScore());
    assertEquals(student, grade.getStudent());
    assertEquals(module, grade.getModule());
  }

  /**
   * Tests setter and getter methods of the Grade class.
   * <p>
   * Ensures that the setters correctly assign values to the fields and the corresponding getters
   * return the expected results.
   * </p>
   */
  @Test
  public void testSettersAndGetters() {
    // Test setters and getters
    Grade newGrade = new Grade();
    newGrade.setScore(90);
    newGrade.setStudent(student);
    newGrade.setModule(module);

    assertEquals(90, newGrade.getScore());
    assertEquals(student, newGrade.getStudent());
    assertEquals(module, newGrade.getModule());
  }

  /**
   * Tests the {@code toString} method for a Grade object with non-null values.
   * <p>
   * Verifies that the string representation of the Grade object matches the expected format using
   * mocked values for the student and module.
   * </p>
   */
  @Test
  public void testToString() {
    // Test toString with mock values for student and module
    String expectedString = "Grade{id=null, score=85, student=1, module=CS101}";
    assertEquals(expectedString, grade.toString());
  }

  /**
   * Tests the {@code toString} method for a Grade object when the student and module are null.
   * <p>
   * Ensures the string representation is still valid even when associated entities are null.
   * </p>
   */
  @Test
  public void testToStringWithNulls() {
    Grade gradeWithNulls = new Grade(85, null, null);
    // Test toString with mock values for student and module
    String expectedString = "Grade{id=null, score=85, student=null, module=null}";
    assertEquals(expectedString, gradeWithNulls.toString());
  }

  /**
   * Tests the behavior of the Grade object when the student is null.
   * <p>
   * Verifies that setting only the module without a student is handled correctly.
   * </p>
   */
  @Test
  public void testGradeWithNullStudent() {
    // Test Grade with null student
    Grade gradeWithNullStudent = new Grade(85, null, module);
    assertNull(gradeWithNullStudent.getStudent());
    assertEquals(module, gradeWithNullStudent.getModule());
  }

  /**
   * Tests the behavior of the Grade object when the module is null.
   * <p>
   * Verifies that setting only the student without a module is handled correctly.
   * </p>
   */
  @Test
  public void testGradeWithNullModule() {
    // Test Grade with null module
    Grade gradeWithNullModule = new Grade(85, student, null);
    assertEquals(student, gradeWithNullModule.getStudent());
    assertNull(gradeWithNullModule.getModule());
  }

  /**
   * Tests the behavior of the Grade object when both the student and module are null.
   * <p>
   * Verifies that the Grade object can still be created and handles null values gracefully.
   * </p>
   */
  @Test
  public void testGradeWithNullStudentAndModule() {
    // Test Grade with both student and module as null
    Grade gradeWithNulls = new Grade(85, null, null);
    assertNull(gradeWithNulls.getStudent());
    assertNull(gradeWithNulls.getModule());
  }

  /**
   * Tests setting the score to a zero value.
   * <p>
   * Verifies that a score of zero is valid and is correctly stored and retrieved from the Grade
   * object.
   * </p>
   */
  @Test
  public void testZeroScore() {
    Grade zeroScoreGrade = new Grade(0, student, module);
    assertEquals(0, zeroScoreGrade.getScore());
  }

  /**
   * Tests the lower and upper boundaries for valid score setting (0 and 100).
   * <p>
   * Ensures the valid range for Grade's scores is respected and no exceptions are thrown during
   * boundary assignment.
   * </p>
   */
  @Test
  public void testSetScoreBoundary() {
    Grade newGrade = new Grade();
    newGrade.setScore(0); // Test lower boundary
    assertEquals(0, newGrade.getScore());

    newGrade.setScore(100); // Test upper boundary
    assertEquals(100, newGrade.getScore());
  }

  /**
   * Tests if setting invalid scores throws {@link InvalidGradeException}.
   * <p>
   * Tests that a negative score will throw an exception, ensuring score validation is implemented
   * properly.
   * </p>
   */
  @Test
  public void testInvalidScore() {
    // Test invalid score (e.g., negative score)
    assertThrows(InvalidGradeException.class, () -> new Grade(-5, student, module));
  }

  /**
   * Tests if maximum valid score value is correctly handled.
   * <p>
   * Ensures a Grade object can have a maximum valid score of 100 without issue.
   * </p>
   */
  @Test
  public void testMaximumScore() {
    // Test maximum valid score
    Grade maxScoreGrade = new Grade(100, student, module);
    assertEquals(100, maxScoreGrade.getScore());
  }

  /**
   * Tests if a score value greater than 100 results in throwing {@link InvalidGradeException}.
   * <p>
   * Ensures Grade enforces valid score constraints properly.
   * </p>
   */
  @Test
  public void testInvalidScoreGreaterThanMaximum() {
    // Test score greater than maximum valid value (e.g., 101)
    assertThrows(InvalidGradeException.class, () -> new Grade(101, student, module));
  }

  /**
   * Tests persistence logic using the repository. Ensures the Grade object can be persisted and
   * retrieved.
   * <p>
   * This tests database interactions and ensures that saved Grade instances match their initial
   * state.
   * </p>
   */
  @Test
  public void testPersistence() {
    // Assuming Grade is a JPA entity, test persistence (requires a repository)
    // Note: You must have an actual repository and a persistence configuration
    gradeRepository.save(grade);

    // Retrieve grade by ID from the repository
    Grade persistedGrade = gradeRepository.findById(grade.getId()).orElseThrow();

    // Assert the persisted grade has the correct attributes
    assertEquals(85, persistedGrade.getScore());
    assertEquals(student, persistedGrade.getStudent());
    assertEquals(module, persistedGrade.getModule());
  }

  /**
   * Tests persistence logic when the student and module are null.
   * <p>
   * Ensures that the Grade object can be persisted and retrieved correctly even when the student
   * and module are null.
   * </p>
   */
  @Test
  public void testPersistenceWithNullStudentAndModule() {
    Grade nullGrade = new Grade(85, null, null);
    gradeRepository.save(nullGrade);

    // Retrieve grade by ID from the repository
    Grade persistedGrade = gradeRepository.findById(nullGrade.getId()).orElseThrow();

    // Assert that the persisted grade has null student and module
    assertNull(persistedGrade.getStudent());
    assertNull(persistedGrade.getModule());
  }

}
