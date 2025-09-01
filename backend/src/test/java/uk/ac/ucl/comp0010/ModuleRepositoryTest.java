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
 * Unit test for the ModuleRepository class.
 * This test class verifies the correct functionality of CRUD operations for the {@link Module}
 * entity and tests the interaction between {@link ModuleRepository}, {@link GradeRepository}, and
 * {@link StudentRepository}. The test cases ensure the repository can save, retrieve, update,
 * delete, and handle edge cases involving {@link Module} entities.
 */
@DataJpaTest
public class ModuleRepositoryTest {

  /**
   * Default constructor for ModuleRepositoryTest.
   */
  public ModuleRepositoryTest() {
  }

  @Autowired
  private ModuleRepository moduleRepository;
  @Autowired
  private StudentRepository studentRepository;
  @Autowired
  private GradeRepository gradeRepository;

  private Module module;

  /**
   * Sets up the test environment by initializing a {@link Module} instance before each test case.
   * This ensures a consistent state for each test by saving a default module to the database.
   */
  @BeforeEach
  void setUp() {
    module = new Module("CS101", "Introduction to Computer Science", true);
    moduleRepository.save(module);
  }

  /**
   * Tests the saving of a module to the database. Verifies that the module's properties are saved
   * and can be retrieved accurately.
   */
  @Test
  void testSaveModule() {
    Module savedModule = moduleRepository.findById("CS101").orElse(null);
    assertNotNull(savedModule);
    assertEquals("CS101", savedModule.getCode());
    assertEquals("Introduction to Computer Science", savedModule.getName());
    assertTrue(savedModule.isMnc());
  }

  /**
   * Tests that a newly saved module has no associated grades initially. Ensures that a module's
   * grade association is empty when first created.
   */
  @Test
  void testModuleHasNoGradesInitially() {
    Module savedModule = moduleRepository.findById("CS101").orElse(null);
    assertNotNull(savedModule);
    assertTrue(savedModule.getGrades().isEmpty(), "Module should have no grades initially");
  }

  /**
   * Tests that a module can be found by its code. Ensures that the repository can locate modules
   * based on their unique identifiers.
   */
  @Test
  void testModuleFindByCode() {
    Module foundModule = moduleRepository.findById("CS101").orElse(null);
    assertNotNull(foundModule);
    assertEquals("CS101", foundModule.getCode());
  }

  /**
   * Tests adding a grade to a module's grades and persisting the change. Verifies that the module's
   * association with the grade is correctly saved and retrievable.
   */
  @Test
  void testModuleSetGrades() {
    Student student = new Student();
    student.setId(1L);
    student.setFirstName("John");
    student.setLastName("Doe");
    student.setUsername("johndoe");
    student.setEmail("johndoe@example.com");
    Grade grade = new Grade(85, student, module);
    studentRepository.save(student);
    gradeRepository.save(grade);


    module.getGrades().add(grade);
    moduleRepository.save(module);

    Module savedModule = moduleRepository.findById("CS101").orElse(null);
    assertNotNull(savedModule);
    assertEquals(1, savedModule.getGrades().size(), "Module should have one grade after adding");
  }

  /**
   * Tests finding a module by code that is expected to have no associated grades. Ensures the
   * repository handles cases of modules with no data associations correctly.
   */
  @Test
  void testFindModuleWithEmptyGrades() {
    Module emptyModule = new Module("CS102", "Data Structures", false);
    moduleRepository.save(emptyModule);

    Module foundModule = moduleRepository.findById("CS102").orElse(null);
    assertNotNull(foundModule);
    assertTrue(foundModule.getGrades().isEmpty(), "Module should have no grades");
  }

  /**
   * Tests saving and associating multiple grades with a module. Verifies the persistence of
   * multiple grade entries related to a specific module.
   */
  @Test
  void testSaveModuleWithGrades() {
    Module moduleWithGrades = new Module("CS103", "Operating Systems", false);
    moduleRepository.save(moduleWithGrades);

    Student student = new Student();
    student.setId(1L);
    student.setFirstName("Jane");
    student.setLastName("Doe");
    student.setUsername("janedoe");
    student.setEmail("janedoe@example.com");
    studentRepository.save(student);

    Grade grade1 = new Grade(90, student, moduleWithGrades);
    Grade grade2 = new Grade(75, student, moduleWithGrades);

    moduleWithGrades.getGrades().add(grade1);
    moduleWithGrades.getGrades().add(grade2);

    moduleRepository.save(moduleWithGrades);

    // Verify the grades are saved
    Module savedModule = moduleRepository.findById("CS103").orElse(null);
    assertNotNull(savedModule);
    assertEquals(2, savedModule.getGrades().size(), "Module should have two grades after adding");
  }

  /**
   * Tests that attempting to retrieve a non-existent module returns null. Verifies that the
   * repository handles edge cases where no matching data exists.
   */
  @Test
  void testModuleNotFound() {
    Module foundModule = moduleRepository.findById("NonExistentModule").orElse(null);
    assertNull(foundModule, "Module with non-existent code should return null");
  }

  /**
   * Tests updating an existing module's properties. Verifies that updates to the database are
   * persisted correctly through the repository.
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

  /**
   * Tests deleting a module from the database. Ensures that deletion prevents the module from being
   * retrievable afterward.
   */
  @Test
  void testDeleteModule() {
    moduleRepository.delete(module);
    Module deletedModule = moduleRepository.findById("CS101").orElse(null);
    assertNull(deletedModule, "Module should be deleted and not found");
  }

  /**
   * Tests the association of grades with modules to ensure correct relationships. Verifies that
   * grades are correctly associated with their respective modules.
   */
  @Test
  void testGradesAssociation() {
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

    Module retrievedModule = moduleRepository.findById("CS101").orElse(null);
    assertNotNull(retrievedModule);
    assertEquals(1, retrievedModule.getGrades().size());
  }
}
