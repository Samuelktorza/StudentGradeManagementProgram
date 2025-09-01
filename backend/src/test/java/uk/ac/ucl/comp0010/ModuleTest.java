package uk.ac.ucl.comp0010;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
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

import java.util.ArrayList;
import java.util.List;


/**
 * Unit test for the Module class. Ensures the correct functionality of methods, constructors, and
 * database behavior.
 */
@DataJpaTest
public class ModuleTest {

  /**
   * Default constructor for ModuleTest.
   */
  public ModuleTest() {
  }

  @Autowired
  private ModuleRepository moduleRepository;
  @Autowired
  private StudentRepository studentRepository;
  @Autowired
  private GradeRepository gradeRepository;

  private Module module;

  /**
   * Sets up the initial test data by creating and saving a default Module instance into the
   * database before each test case runs.
   */
  @BeforeEach
  void setUp() {
    // Initialize the module with basic data
    module = new Module("CS101", "Introduction to Computer Science", true);
    moduleRepository.save(module);
  }

  /**
   * Tests JSON serialization for the `Module` class to ensure that the grades list is excluded.
   *
   * @throws JsonProcessingException if an error occurs during JSON serialization
   */
  @Test
  void testJsonIgnoreOnGrades() throws JsonProcessingException {
    ObjectMapper objectMapper = new ObjectMapper();
    String json = objectMapper.writeValueAsString(module);
    assertFalse(json.contains("grades"), "Grades field should be ignored in JSON serialization");
  }

  /**
   * Tests the default constructor of the `Module` class. Verifies that the default values for
   * fields are set properly upon initialization.
   */
  @Test
  void testDefaultConstructor() {
    Module module = new Module();
    assertNull(module.getCode(), "Code should be null by default");
    assertNull(module.getName(), "Name should be null by default");
    assertFalse(module.isMnc(), "MNC should be false by default");
    assertNotNull(module.getGrades(), "Grades list should be initialized");
    assertTrue(module.getGrades().isEmpty(), "Grades list should be empty by default");
  }

  /**
   * Tests the parameterized constructor for the `Module` class. Verifies that the fields are set
   * correctly with the provided parameters.
   */
  @Test
  void testParameterizedConstructor() {
    Module module = new Module("CS101", "Introduction to Computer Science", true);
    assertEquals("CS101", module.getCode());
    assertEquals("Introduction to Computer Science", module.getName());
    assertTrue(module.isMnc());
  }

  /**
   * Tests the implementation of the {@code toString()} method in the `Module` class. Verifies that
   * the string representation contains the expected fields.
   */
  @Test
  void testToString() {
    Module module = new Module("CS101", "Introduction to Computer Science", true);
    String toStringOutput = module.toString();
    assertTrue(toStringOutput.contains("CS101"), "ToString should include the code");
    assertTrue(toStringOutput.contains("Introduction to Computer Science"),
        "ToString should include the name");
    assertTrue(toStringOutput.contains("true"), "ToString should include MNC status");
  }

  /**
   * Tests the getter and setter methods for the `Module` class. Verifies that the fields can be
   * modified and retrieved as expected.
   */
  @Test
  void testGettersAndSetters() {
    Module module = new Module();
    module.setCode("CS101");
    module.setName("Computer Science 101");
    module.setMnc(true);

    assertEquals("CS101", module.getCode());
    assertEquals("Computer Science 101", module.getName());
    assertTrue(module.isMnc());
  }

  /**
   * Tests that a newly created `Module` instance has no associated grades by default.
   */
  @Test
  void testModuleHasNoGradesInitially() {
    Module savedModule = moduleRepository.findById("CS101").orElse(null);
    assertNotNull(savedModule);
    assertTrue(savedModule.getGrades().isEmpty(), "Module should have no grades initially");
  }

  /**
   * Tests that a newly created module has an empty grades list upon initialization.
   */
  @Test
  void testGetGradesWhenEmpty() {
    Module emptyModule = new Module("CS105", "Introduction to Data Science", true);
    assertTrue(emptyModule.getGrades().isEmpty(), "Grades list should be empty initially");
  }

  /**
   * Tests updating the grades list manually using the `setGrades()` method.
   */
  @Test
  void testSetGrades() {
    List<Grade> newGrades = new ArrayList<>();
    module.setGrades(newGrades);
    assertSame(newGrades, module.getGrades(), "Grades list should be updated correctly");
  }

  /**
   * Tests saving a grade to the database and associating it with a `Module`.
   */
  @Test
  void testModuleSetGrades() {
    Student student = new Student();
    student.setId(1L);
    student.setFirstName("John");
    student.setLastName("Doe");
    student.setUsername("johndoe");
    student.setEmail("johndoe@example.com");
    studentRepository.save(student);

    Grade grade = new Grade(85, student, module);
    gradeRepository.save(grade);

    module.getGrades().add(grade);
    moduleRepository.save(module);

    Module savedModule = moduleRepository.findById("CS101").orElse(null);
    assertNotNull(savedModule);
    assertEquals(1, savedModule.getGrades().size(), "Module should have one grade after adding");
  }

  /**
   * Tests finding a module by its code in the repository.
   */
  @Test
  void testModuleFindByCode() {
    Module foundModule = moduleRepository.findById("CS101").orElse(null);
    assertNotNull(foundModule);
    assertEquals("CS101", foundModule.getCode());
  }

  /**
   * Tests saving a module with multiple grades and verifies the persistence logic.
   */
  @Test
  void testSaveModuleWithGrades() {
    Module moduleWithGrades = new Module("CS103", "Operating Systems", false);
    moduleRepository.save(moduleWithGrades);

    Student student = new Student();
    student.setId(2L);
    student.setFirstName("Jane");
    student.setLastName("Doe");
    student.setUsername("janedoe");
    student.setEmail("janedoe@example.com");
    studentRepository.save(student);

    Grade grade1 = new Grade(90, student, moduleWithGrades);
    Grade grade2 = new Grade(75, student, moduleWithGrades);

    gradeRepository.save(grade1);
    gradeRepository.save(grade2);

    moduleWithGrades.getGrades().add(grade1);
    moduleWithGrades.getGrades().add(grade2);

    moduleRepository.save(moduleWithGrades);

    // Verify the grades are saved
    Module savedModule = moduleRepository.findById("CS103").orElse(null);
    assertNotNull(savedModule);
    assertEquals(2, savedModule.getGrades().size(), "Module should have two grades after adding");
  }

  /**
   * Tests that searching for a non-existent module returns null.
   */
  @Test
  void testModuleNotFound() {
    Module foundModule = moduleRepository.findById("NonExistentModule").orElse(null);
    assertNull(foundModule, "Module with non-existent code should return null");
  }

  /**
   * Tests updating a module's name and ensuring the change is persisted to the database.
   */
  @Test
  void testUpdateModule() {
    Module updatedModule = moduleRepository.findById("CS101").orElse(null);
    updatedModule.setName("Advanced Computer Science");
    moduleRepository.save(updatedModule);

    Module savedModule = moduleRepository.findById("CS101").orElse(null);
    assertNotNull(savedModule);
    assertEquals("Advanced Computer Science", savedModule.getName(),
        "Module name should be updated");
  }

  //@Test
  //void testDeleteModule() {
  //    moduleRepository.delete(module);
  //    Module deletedModule = moduleRepository.findById("CS101").orElse(null);
  //    assertNull(deletedModule, "Module should be deleted and not found");
  //}

  /**
   * Tests the association between a `Module` and a `Grade` object.
   */
  @Test
  void testGradesAssociation() {
    Student student = new Student();
    student.setId(3L);
    student.setFirstName("Alice");
    student.setLastName("Smith");
    student.setUsername("alicesmith");
    student.setEmail("alicesmith@example.com");
    studentRepository.save(student);

    Grade grade = new Grade(92, student, module);
    gradeRepository.save(grade);

    module.getGrades().add(grade);
    moduleRepository.save(module);

    Module retrievedModule = moduleRepository.findById("CS101").orElse(null);
    assertNotNull(retrievedModule);
    assertEquals(1, retrievedModule.getGrades().size(),
        "Module should have one grade after adding");
  }

  /**
   * Tests that a module with no grades has an empty grades list.
   */
  @Test
  void testModuleWithEmptyGrades() {
    Module emptyModule = new Module("CS102", "Data Structures", false);
    moduleRepository.save(emptyModule);

    Module foundModule = moduleRepository.findById("CS102").orElse(null);
    assertNotNull(foundModule);
    assertTrue(foundModule.getGrades().isEmpty(), "Module should have no grades");
  }
}
