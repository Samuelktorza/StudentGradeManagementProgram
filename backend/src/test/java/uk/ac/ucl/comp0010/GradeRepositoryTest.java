package uk.ac.ucl.comp0010;

import static org.assertj.core.api.AssertionsForInterfaceTypes.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
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

import java.util.List;
import java.util.Optional;


/**
 * Unit test class for testing {@link GradeRepository} functionality.
 * <p>
 * This class ensures the correct implementation of CRUD operations and query logic in the
 * repository interacting with the {@link Grade}, {@link Student}, and {@link Module} entities. The
 * tests verify scenarios such as creating, saving, retrieving, deleting, and querying data related
 * to grades in different edge cases and valid cases. Tests also ensure that repository queries like
 * {@code findByStudentId} and {@code findByStudentAndModule} return expected results in valid and
 * invalid query conditions.
 * </p>
 */
@DataJpaTest
public class GradeRepositoryTest {

  /**
   * Default constructor for GradeRepositoryTest.
   */
  public GradeRepositoryTest() {
  }

  @Autowired
  private GradeRepository gradeRepository;
  @Autowired
  private StudentRepository studentRepository;
  @Autowired
  private ModuleRepository moduleRepository;

  private Student student;
  private Module module;
  private Grade grade;

  /**
   * Set up the database state before each test.
   * <p>
   * Initializes a student, a module, and a grade to ensure a consistent database state for tests.
   * Saves these entities to their respective repositories to be used in the tests.
   * </p>
   */
  @BeforeEach
  public void setUp() {
    // Initialize student and module for testing
    student = new Student();
    student.setId(1L);
    student.setFirstName("John");
    student.setLastName("Doe");
    student.setUsername("johndoe");
    student.setEmail("johndoe@example.com");
    module = new Module("CS101", "Introduction to Computer Science", false);

    student = studentRepository.save(student);
    module = moduleRepository.save(module);

    // Create a grade for this student and module
    grade = new Grade(85, student, module);

    // Save grade to repository
    gradeRepository.save(grade);
  }

  /**
   * Tests fetching grades by student ID when valid data exists.
   * <p>
   * Verifies that: 1. Grades are returned when queried by a valid student ID. 2. The number of
   * records returned is exactly 1.
   * </p>
   */
  @Test
  public void testFindByStudentId_Valid() {
    // Fetch grades by student ID
    List<Grade> grades = gradeRepository.findByStudentId(student.getId());

    // Check that grades are returned correctly
    assertThat(grades).isNotEmpty();
    assertThat(grades).hasSize(1);  // There should be exactly 1 grade for this student
    assertThat(grades.get(0).getStudent().getId()).isEqualTo(student.getId());
  }

  /**
   * Tests querying grades by student ID when no data exists for that student.
   * <p>
   * Ensures that no grades are returned when querying a non-associated student's ID.
   * </p>
   */
  @Test
  public void testFindByStudentId_NoGrades() {
    // Create a new student with no grades
    Student newStudent = new Student();
    newStudent.setId(2L);
    newStudent.setFirstName("Jane");
    newStudent.setLastName("Smith");
    newStudent.setUsername("janesmith");
    newStudent.setEmail("jane.smith@example.com");

    // Save the new student to the repository
    newStudent = studentRepository.save(newStudent);

    // Try to fetch grades by this new student ID
    List<Grade> grades = gradeRepository.findByStudentId(newStudent.getId());

    // Ensure no grades are found
    assertThat(grades).isEmpty();
  }

  /**
   * Tests querying by student and module combination when valid data is present.
   * <p>
   * Verifies the grade is found and matches the expected score, student, and module.
   * </p>
   */
  @Test
  public void testFindByStudentAndModule_Valid() {
    // Test that a valid student and module combination returns a grade
    Optional<Grade> foundGrade = gradeRepository.findByStudentAndModule(student, module);

    assertTrue(foundGrade.isPresent());
    assertEquals(85, foundGrade.get().getScore());
    assertEquals(student, foundGrade.get().getStudent());
    assertEquals(module, foundGrade.get().getModule());
  }

  /**
   * Tests querying by student and module combination when no such grade exists.
   * <p>
   * Ensures that querying with non-existent combinations of students and modules returns empty.
   * </p>
   */
  @Test
  public void testFindByStudentAndModule_NotFound() {
    // Test that a non-existing grade (with different student/module) returns empty
    Student newStudent = new Student();
    newStudent.setId(2L);
    newStudent.setFirstName("Jane");
    student.setLastName("Smith");
    student.setUsername("janesmith");
    student.setEmail("jane.smith@example.com");
    Module newModule = new Module("CS102", "Data Structures", false);

    // Save new student and module to repositories
    newStudent = studentRepository.save(newStudent);
    newModule = moduleRepository.save(newModule);

    Optional<Grade> foundGrade = gradeRepository.findByStudentAndModule(newStudent, newModule);

    assertFalse(foundGrade.isPresent());
  }

  /**
   * Tests querying by student and module when null values are passed.
   * <p>
   * Verifies the repository correctly returns empty results for null queries.
   * </p>
   */
  @Test
  public void testFindByStudentAndModule_NullValues() {
    Optional<Grade> foundGrade = gradeRepository.findByStudentAndModule(null, null);
    assertFalse(foundGrade.isPresent()); // Assuming it should return empty for null values
  }

  /**
   * Tests deleting a grade from the repository.
   * <p>
   * Verifies that after deletion, the grade is no longer retrievable from the repository.
   * </p>
   */
  @Test
  public void testDeleteGrade() {
    Grade savedGrade = gradeRepository.save(grade);
    gradeRepository.delete(savedGrade);

    Optional<Grade> deletedGrade = gradeRepository.findById(savedGrade.getId());
    assertFalse(deletedGrade.isPresent()); // The grade should not be found after deletion
  }

  /**
   * Tests the ability to retrieve all grades in the repository.
   * <p>
   * Ensures that all saved grades are accessible through repository queries.
   * </p>
   */
  @Test
  public void testFindAllGrades() {
    Grade anotherGrade = new Grade(90, student, module);
    gradeRepository.save(grade);
    gradeRepository.save(anotherGrade);

    Iterable<Grade> allGrades = gradeRepository.findAll();
    assertTrue(allGrades.iterator().hasNext()); // Ensure there are grades in the repository
  }

  /**
   * Tests querying by student and module when one of the arguments is null.
   * <p>
   * Ensures that the repository handles null arguments correctly and returns empty results.
   * </p>
   */
  @Test
  public void testFindByStudentAndModule_OneNullArgument() {
    Optional<Grade> foundGradeWithNullStudent =
        gradeRepository.findByStudentAndModule(null, module);
    assertFalse(foundGradeWithNullStudent.isPresent()); // Ensure it handles null student correctly

    Optional<Grade> foundGradeWithNullModule =
        gradeRepository.findByStudentAndModule(student, null);
    assertFalse(foundGradeWithNullModule.isPresent()); // Ensure it handles null module correctly
  }

  /**
   * Tests querying by student and module when both arguments are null.
   * <p>
   * Ensures that the repository handles null arguments correctly and returns empty results.
   * </p>
   */
  @Test
  public void testSaveGrade() {
    // Test saving a grade and retrieving it by ID
    Grade savedGrade = gradeRepository.save(grade);
    Optional<Grade> retrievedGrade = gradeRepository.findById(savedGrade.getId());

    assertTrue(retrievedGrade.isPresent());
    assertEquals(grade.getScore(), retrievedGrade.get().getScore());
    assertEquals(grade.getStudent(), retrievedGrade.get().getStudent());
    assertEquals(grade.getModule(), retrievedGrade.get().getModule());
  }

  /**
   * Tests saving a grade with null values.
   * <p>
   * Ensures that the repository can save grades with null student or module values.
   * </p>
   */
  @Test
  public void testPersistenceWithNullValues() {
    // Test saving with null student or module, assuming nulls are allowed in your design
    Grade gradeWithNullStudent = new Grade(90, null, module);
    Grade gradeWithNullModule = new Grade(90, student, null);

    // Save grades with null values and check persistence
    gradeRepository.save(gradeWithNullStudent);
    gradeRepository.save(gradeWithNullModule);

    Optional<Grade> retrievedGradeWithNullStudent =
        gradeRepository.findByStudentAndModule(null, module);
    Optional<Grade> retrievedGradeWithNullModule =
        gradeRepository.findByStudentAndModule(student, null);

    assertTrue(retrievedGradeWithNullStudent.isPresent());
    assertTrue(retrievedGradeWithNullModule.isPresent());
  }

}
