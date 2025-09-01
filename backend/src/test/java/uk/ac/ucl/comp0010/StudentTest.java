package uk.ac.ucl.comp0010;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import uk.ac.ucl.comp0010.grade.Grade;
import uk.ac.ucl.comp0010.grade.GradeRepository;
import uk.ac.ucl.comp0010.module.Module;
import uk.ac.ucl.comp0010.module.ModuleRepository;
import uk.ac.ucl.comp0010.student.Student;
import uk.ac.ucl.comp0010.student.StudentRepository;


/**
 * Unit test for the {@link Student} class. This class validates the functionality of constructors,
 * getters, setters, and custom methods within the `Student` class.
 */
@DataJpaTest
public class StudentTest {

  /**
   * Default constructor for StudentTest.
   */
  public StudentTest() {
  }

  @Autowired
  private ModuleRepository moduleRepository;
  @Autowired
  private StudentRepository studentRepository;
  @Autowired
  private GradeRepository gradeRepository;

  private Student myStudent;
  private Module myFirstModule;
  private Module mySecondModule;
  private Grade myFirstModuleGrade;
  private Grade mySecondModuleGrade;

  /**
   * Helper method to create a test {@link Student} object with given attributes.
   *
   * @param id        The unique identifier for the student.
   * @param firstName The first name of the student.
   * @param lastName  The last name of the student.
   * @param email     The email address of the student.
   * @param username  The username for the student.
   * @return A {@link Student} object initialized with the provided details.
   */
  private Student createTestStudent(Long id, String firstName, String lastName, String email,
      String username) {
    Student student = new Student();
    student.setId(id);
    student.setFirstName(firstName);
    student.setLastName(lastName);
    student.setEmail(email);
    student.setUsername(username);
    return student;
  }

  /**
   * Initializes the test environment by creating and saving a test student. Runs before each test
   * case to ensure a consistent initial state.
   */
  @BeforeEach
  void setUp() {
    // Initialize the module with basic data
    Student myFirstStudent =
        createTestStudent(1L, "First", "Student", "firststudent@mail.com", "firststudent1");
    studentRepository.save(myFirstStudent);
  }

  /**
   * Tests the {@link Student#toString()} method. Verifies that the string representation of a
   * student contains key details about the student.
   */
  @Test
  void testToString() {
    Student student = studentRepository.findById(1L).orElse(null);
    String toStringOutput = student.toString();
    assertTrue(toStringOutput.contains("First"));
    assertTrue(toStringOutput.contains("Student"));
    assertTrue(toStringOutput.contains("firststudent1"));
    assertTrue(toStringOutput.contains("firststudent@mail.com"));
  }

  /**
   * Tests the getter and setter methods for the {@link Student} class. Validates that all fields
   * can be set and retrieved correctly.
   */
  @Test
  void testGettersAndSetters() {
    Student student = new Student();
    student.setId(1L);
    student.setFirstName("First");
    student.setLastName("Student");
    student.setUsername("firststudent1");
    student.setEmail("firststudent@mail.com");

    assertEquals(1L, student.getId());
    assertEquals("First", student.getFirstName());
    assertEquals("Student", student.getLastName());
    assertEquals("firststudent1", student.getUsername());
    assertEquals("firststudent@mail.com", student.getEmail());
  }

  /**
   * Tests {@link Student#getGradeByModule(Module)} when a grade is present for the given module.
   * Validates that the correct grade is retrieved.
   */
  @Test
  void testGetGradeByModuleWithGrade() {
    // Arrange
    Student student = studentRepository.findById(1L).orElse(null);
    assertNotNull(student, "Student should exist in the database.");

    Module module = new Module("TM1", "TestModule1", false);
    moduleRepository.save(module);

    Grade grade = new Grade(85, student, module);
    gradeRepository.save(grade);
    student.addGrade(grade);
    studentRepository.save(student);

    // Act
    Grade result = student.getGradeByModule(module);

    // Assert
    assertNotNull(result, "Grade should be found for the given module.");
    assertEquals(85, result.getScore(), "The grade for the module should be 85.");
  }

  /**
   * Tests {@link Student#getGradeByModule(Module)} when no grade exists for the given module.
   * Validates that the method returns null in such cases.
   */
  @Test
  void testGetGradeByModuleNoGrade() {
    // Arrange
    Student student = studentRepository.findById(1L).orElse(null);
    assertNotNull(student, "Student should exist in the database.");

    Module module = new Module("TM1", "TestModule1", false);
    moduleRepository.save(module);

    // Act
    Grade result = student.getGradeByModule(module);

    // Assert
    assertNull(result, "Grade should be null when no grade is assigned to the module.");
  }

  /**
   * Tests {@link Student#getGradeByModule(Module)} when multiple grades are associated with the
   * student. Ensures that the correct grade is retrieved for the specified module.
   */
  @Test
  void testGetGradeByModuleWithMultipleGrades() {
    // Arrange
    Student student = studentRepository.findById(1L).orElse(null);
    assertNotNull(student, "Student should exist in the database.");

    Module module1 = new Module("TM1", "TestModule1", false);
    Module module2 = new Module("TM2", "TestModule2", true);
    moduleRepository.save(module1);
    moduleRepository.save(module2);

    Grade grade1 = new Grade(85, student, module1);
    Grade grade2 = new Grade(90, student, module2);
    gradeRepository.save(grade1);
    gradeRepository.save(grade2);
    student.addGrade(grade1);
    student.addGrade(grade2);
    studentRepository.save(student);

    // Act
    Grade result = student.getGradeByModule(module2);

    // Assert
    assertNotNull(result, "Grade should be found for the second module.");
    assertEquals(90, result.getScore(), "The grade for the second module should be 90.");
  }

  /**
   * Tests {@link Student#getGradeByModule(Module)} when a grade exists, but not for the requested
   * module. Verifies that the method returns null in such cases.
   */
  @Test
  void testGetGradeByModuleWithNoMatchingGrade() {
    // Arrange
    Student student = studentRepository.findById(1L).orElse(null);
    assertNotNull(student, "Student should exist in the database.");

    Module module1 = new Module("TM1", "TestModule1", false);
    Module module2 = new Module("TM2", "TestModule2", true);
    moduleRepository.save(module1);
    moduleRepository.save(module2);

    Grade grade = new Grade(85, student, module1);
    gradeRepository.save(grade);
    student.addGrade(grade);
    studentRepository.save(student);

    // Act
    Grade result = student.getGradeByModule(module2);

    // Assert
    assertNull(result,
        "Grade should be null when the student has no grade for the requested module.");
  }

  /**
   * Tests {@link Student#computeAverage()} when the student has no grades. Verifies that the method
   * correctly returns an average of 0 in such cases.
   */
  @Test
  void testComputeAverageWhenNoGrades() {
    Student student = studentRepository.findById(1L).orElse(null);
    assertNotNull(student);
    assertEquals(0, student.computeAverage(), "Average should be 0 when no grades are present");
  }

  /**
   * Tests {@link Student#computeAverage()} when the student has multiple grades. Verifies that the
   * method computes the correct average.
   */
  @Test
  void testComputeAveragesWithGrades() {
    // Create modules
    myFirstModule = new Module("TM1", "TestModule1", false);
    mySecondModule = new Module("TM2", "TestModule2", true);  // Fix assignment
    moduleRepository.save(myFirstModule);
    moduleRepository.save(mySecondModule);

    // Ensure student exists
    Student student = studentRepository.findById(1L).orElse(null);
    assertNotNull(student, "Student with ID 1L should be found.");

    // Create and save grades
    myFirstModuleGrade = new Grade(85, student, myFirstModule);
    mySecondModuleGrade = new Grade(90, student, mySecondModule);
    gradeRepository.save(myFirstModuleGrade);
    gradeRepository.save(mySecondModuleGrade);

    // Add grades to the student
    student.addGrade(myFirstModuleGrade);
    student.addGrade(mySecondModuleGrade);
    studentRepository.save(student);

    // Re-fetch the student and compute the average
    student = studentRepository.findById(1L).orElse(null);
    assertNotNull(student);

    double expectedAverage = (85 + 90) / 2.0;
    assertEquals(expectedAverage, student.computeAverage(), 0.001,
        "Average should be 87.5 when two grades are present");
  }


}
