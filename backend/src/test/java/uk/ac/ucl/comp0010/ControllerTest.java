package uk.ac.ucl.comp0010;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.anyList;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import uk.ac.ucl.comp0010.controller.Controller;
import uk.ac.ucl.comp0010.grade.Grade;
import uk.ac.ucl.comp0010.grade.GradeRepository;
import uk.ac.ucl.comp0010.module.Module;
import uk.ac.ucl.comp0010.module.ModuleRepository;
import uk.ac.ucl.comp0010.registration.Registration;
import uk.ac.ucl.comp0010.registration.RegistrationRepository;
import uk.ac.ucl.comp0010.student.Student;
import uk.ac.ucl.comp0010.student.StudentRepository;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;


/**
 * Unit tests for the {@code Controller} class.
 * <p>
 * This class uses Mockito to mock dependencies and verify the behavior of the {@link Controller}
 * methods under different conditions. It ensures that the application logic adheres to specified
 * requirements.
 * </p>
 */

public class ControllerTest {

  /**
   * Default constructor for ControllerTest.
   */
  public ControllerTest() {
  }

  /**
   * Injects the mocked dependencies into the {@link Controller} instance being tested.
   */
  @InjectMocks
  Controller myController;
  @Mock
  ModuleRepository moduleRepository;
  @Mock
  RegistrationRepository registrationRepository;
  @Mock
  StudentRepository studentRepository;

  @Mock
  GradeRepository gradeRepository;
  Module myFirstModule;
  Module mySecondModule;

  /**
   * Utility method to create a test {@link Student} instance with specified attributes.
   *
   * @param id        the unique ID of the student.
   * @param firstName the first name of the student.
   * @param lastName  the last name of the student.
   * @param email     the email address of the student.
   * @param username  the username of the student.
   * @return a {@link Student} instance populated with the provided details.
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
   * Initializes the mock objects and prepares the test environment.
   * <p>
   * This method is executed before each test case using the {@link BeforeEach} annotation. It
   * ensures a fresh set of mock objects and resets the state between tests.
   * </p>
   */
  @BeforeEach
  public void setup() {
    // Function which will be executed before each test
    MockitoAnnotations.openMocks(this);
  }

  /**
   * Tests the {@link Controller#getGradesByModuleCode(String)} method for the scenario where the
   * module does not exist.
   * <p>
   * The test expects a {@link ResponseEntity} with a 404 Not Found status in this case.
   * </p>
   */
  @Test
  public void testGetGradesByModuleIdWhereModuleNotFound() {
    assertThat(myController.getGradesByModuleCode("-1L")).isEqualTo(
        ResponseEntity.notFound().build());
  }

  /**
   * Tests the {@link Controller#registerStudent(Registration)} method for the scenario where the
   * student is already registered for the specified module.
   * <p>
   * The test mocks the repositories to simulate the existing registration and verifies that the
   * appropriate response (400 Bad Request) and message ("This registration already exists.") are
   * returned.
   * </p>
   */
  @Test
  public void testRegisterStudentIfAlreadyExists() {
    Student myFirstStudent =
        createTestStudent(1L, "First", "Student", "firststudent@mail.com", "firststudent1");
    Module myFirstModule = new Module("TM1", "TestModule1", false);
    Registration myFirstStudentToFirstModuleRegistration =
        new Registration(myFirstStudent, myFirstModule);

    Mockito.when(moduleRepository.findById(myFirstModule.getCode()))
        .thenReturn(Optional.of(myFirstModule));

    Mockito.when(registrationRepository.existsByStudentIdAndModuleCode(myFirstStudent.getId(),
        myFirstModule.getCode())).thenReturn(true);

    ResponseEntity<?> response =
        myController.registerStudent(myFirstStudentToFirstModuleRegistration);

    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);  // Correct status
    assertThat(response.getBody()).isEqualTo(
        "This registration already exists.");  // Correct message

    Mockito.verify(registrationRepository, Mockito.times(1))
        .existsByStudentIdAndModuleCode(myFirstStudent.getId(), myFirstModule.getCode());
  }

  /**
   * Tests the {@link Controller#getGradesByModuleCode(String)} method for the scenario where no
   * grades are associated with the specified module.
   * <p>
   * The test ensures that the method returns a 404 Not Found response when no grades are found.
   * </p>
   */
  @Test
  public void testGetGradesByModuleIdNoModuleGrades() {
    // Test for a case where we have a student, a module, and a registration, but no grades
    Student myFirstStudent =
        createTestStudent(1L, "First", "Student", "firststudent@mail.com", "firststudent1");
    Mockito.when(studentRepository.findById(1L)).thenReturn(Optional.of(myFirstStudent));

    myFirstModule = new Module("TM1", "TestModule1", false);
    myFirstModule.setCode("1");
    Mockito.when(moduleRepository.findById("1L")).thenReturn(Optional.of(myFirstModule));

    Registration myFirstStudentToFirstModuleRegistration =
        new Registration(myFirstStudent, myFirstModule);
    Mockito.when(registrationRepository.findAll())
        .thenReturn(List.of(myFirstStudentToFirstModuleRegistration));

    assertThat(myController.getGradesByModuleCode(myFirstModule.getCode())).isEqualTo(
        ResponseEntity.notFound().build());
  }

  /**
   * Tests the {@link Controller#getGradesByModuleCode(String)} method for the scenario where grades
   * are associated with the specified module.
   * <p>
   * The test verifies that the method returns the expected grades for the module.
   * </p>
   */
  @Test
  public void testGetStudents() {
    Student myFirstStudent =
        createTestStudent(1L, "First", "Student", "firststudent@mail.com", "firststudent1");
    Student mySecondStudent =
        createTestStudent(2L, "Second", "Student", "secondstudent@mail.com", "secondstudent2");
    List<Student> expectedStudents = List.of(myFirstStudent, mySecondStudent);
    Mockito.when(studentRepository.findAll()).thenReturn(expectedStudents);

    List<Student> actualStudents = myController.getStudents();

    assertThat(actualStudents).isEqualTo(expectedStudents);
    Mockito.verify(studentRepository, Mockito.times(1))
        .findAll(); // Ensure findAll() is called once
  }

  /**
   * Tests the {@link Controller#getGradesByModuleCode(String)} method for the scenario where
   * multiple students are registered for a module and have grades.
   * <p>
   * The test verifies that the correct grades are returned for a specific module.
   * </p>
   */
  @Test
  public void testGetGradesByModuleIdForTwoStudents() {
    // Test for a case with a student registered to Modules 1 and 2 with grades in each, and
    // another student registered to only Module 2 with a grade
    Student myFirstStudent =
        createTestStudent(1L, "First", "Student", "firststudent@mail.com", "firststudent1");
    Student mySecondStudent =
        createTestStudent(2L, "Second", "Student", "secondstudent@mail.com", "secondstudent2");
    Mockito.when(studentRepository.findById(1L)).thenReturn(Optional.of(myFirstStudent));
    Mockito.when(studentRepository.findById(2L)).thenReturn(Optional.of(mySecondStudent));

    myFirstModule = new Module("TM1", "TestModule1", false);
    myFirstModule.setCode("1");
    mySecondModule = new Module("TM2", "TestModule2", false);
    mySecondModule.setCode("2");
    Mockito.when(moduleRepository.findById("1")).thenReturn(Optional.of(myFirstModule));
    Mockito.when(moduleRepository.findById("2")).thenReturn(Optional.of(mySecondModule));

    Registration myFirstStudentToFirstModuleRegistration =
        new Registration(myFirstStudent, myFirstModule);
    Registration myFirstStudentToSecondModuleRegistration =
        new Registration(myFirstStudent, mySecondModule);
    Registration mySecondStudentToSecondModuleRegistration =
        new Registration(mySecondStudent, mySecondModule);
    Mockito.when(registrationRepository.findAll()).thenReturn(
        List.of(myFirstStudentToFirstModuleRegistration, myFirstStudentToSecondModuleRegistration,
            mySecondStudentToSecondModuleRegistration));

    // Test the getGradesByModuleId method
    Grade firstStudentFirstModuleGrade = new Grade(10, myFirstStudent, myFirstModule);
    Grade firstStudentSecondModuleGrade = new Grade(10, myFirstStudent, mySecondModule);
    myFirstStudent.addGrade(firstStudentFirstModuleGrade);
    myFirstStudent.addGrade(firstStudentSecondModuleGrade);

    Grade secondStudentSecondModuleGrade = new Grade(25, mySecondStudent, mySecondModule);
    mySecondStudent.addGrade(secondStudentSecondModuleGrade);

    assertThat(myController.getGradesByModuleCode(myFirstModule.getCode())).isEqualTo(
        ResponseEntity.ok(List.of(firstStudentFirstModuleGrade)));
    assertThat(myController.getGradesByModuleCode(mySecondModule.getCode())).isEqualTo(
        ResponseEntity.ok(List.of(firstStudentSecondModuleGrade, secondStudentSecondModuleGrade)));
  }

  /**
   * Tests the {@link Controller#getGradesByModuleCode(String)} method for a module with no grades.
   * <p>
   * This test sets up students and registrations but does not assign grades to verify the response
   * when no grades are present.
   * </p>
   */
  public void testGetGradesByModuleIdForTwoStudentsWhenNoGradesForModule() {
    Student myFirstStudent =
        createTestStudent(1L, "First", "Student", "firststudent@mail.com", "firststudent1");
    Student mySecondStudent =
        createTestStudent(2L, "Second", "Student", "secondstudent@mail.com", "secondstudent2");
    Mockito.when(studentRepository.findById(1L)).thenReturn(Optional.of(myFirstStudent));
    Mockito.when(studentRepository.findById(2L)).thenReturn(Optional.of(mySecondStudent));
  }

  /**
   * Tests the {@link Controller#getRegisteredStudentsByModuleCode(String)} method for the scenario
   * where the module is not found.
   * <p>
   * Verifies that a 404 Not Found response is returned when the module does not exist.
   * </p>
   */
  @Test
  public void testGetRegisteredStudentsByModuleCodeWhereModuleNotFound() {
    // Test for a case with a student registered to Modules 1 and 2 with grades in each,
    // and another student registered to only Module 2 with a grade
    assertThat(myController.getRegisteredStudentsByModuleCode("-1L")).isEqualTo(
        ResponseEntity.notFound().build());
  }

  /**
   * Tests the {@link Controller#registerStudent(Registration)} method for a new registration.
   * <p>
   * This test verifies that a new registration is saved to the repository and the appropriate
   * response (200 OK) is returned.
   * </p>
   */
  @Test
  public void testNewRegisteredStudentSaved() {
    Student myFirstStudent =
        createTestStudent(1L, "First", "Student", "firststudent@mail.com", "firststudent1");
    Module myFirstModule = new Module("TM1", "TestModule1", false);
    Registration myFirstStudentToFirstModuleRegistration =
        new Registration(myFirstStudent, myFirstModule);

    Mockito.when(moduleRepository.findById(myFirstModule.getCode()))
        .thenReturn(Optional.of(myFirstModule));

    Mockito.when(registrationRepository.save(myFirstStudentToFirstModuleRegistration))
        .thenReturn(myFirstStudentToFirstModuleRegistration);

    ResponseEntity<?> response =
        myController.registerStudent(myFirstStudentToFirstModuleRegistration);

    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);  // Status should be 200 OK
    assertThat(response.getBody()).isEqualTo(
        myFirstStudentToFirstModuleRegistration);  // Body should contain the saved registration
  }


  /**
   * Tests the {@link Controller#getRegisteredStudentsByModuleCode(String)} method.
   * <p>
   * This test ensures that the method correctly retrieves a list of students registered for a
   * specific module.
   * </p>
   */
  @Test
  public void testGetRegisteredStudentsByModuleCode() {
    // Test for a case with a student registered to Modules 1 and 2 with grades in each,
    // and another student registered to only Module 2 with a grade
    Student myFirstStudent =
        createTestStudent(1L, "First", "Student", "firststudent@mail.com", "firststudent1");
    Student mySecondStudent =
        createTestStudent(2L, "Second", "Student", "secondstudent@mail.com", "secondstudent2");
    Mockito.when(studentRepository.findById(1L)).thenReturn(Optional.of(myFirstStudent));
    Mockito.when(studentRepository.findById(2L)).thenReturn(Optional.of(mySecondStudent));

    myFirstModule = new Module("TM1", "TestModule1", false);
    myFirstModule.setCode("1");
    Mockito.when(moduleRepository.findById("1")).thenReturn(Optional.of(myFirstModule));

    Registration myFirstStudentToFirstModuleRegistration =
        new Registration(myFirstStudent, myFirstModule);
    Mockito.when(registrationRepository.findAll())
        .thenReturn(List.of(myFirstStudentToFirstModuleRegistration));

    assertThat(myController.getRegisteredStudentsByModuleCode(myFirstModule.getCode())).isEqualTo(
        ResponseEntity.ok(List.of(myFirstStudent)));
  }

  /**
   * Tests the {@link Controller#getRegisteredStudentsByModuleCode(String)} method for a module with
   * no matching registrations.
   * <p>
   * Verifies that the response correctly handles modules with no students registered.
   * </p>
   */
  @Test
  public void testGetRegisteredStudentsByModuleCodeWithNonMatchingRegistration() {
    myFirstModule = new Module("TM1", "TestModule1", false);
    myFirstModule.setCode("1");
    mySecondModule = new Module("TM2", "TestModule2", false);
    mySecondModule.setCode("2");

    Registration registration = new Registration();
    registration.setModule(mySecondModule);
    Mockito.when(moduleRepository.findById("1")).thenReturn(Optional.of(myFirstModule));
    Mockito.when(registrationRepository.findAll()).thenReturn(List.of(registration));

    ResponseEntity<List<Student>> response =
        myController.getRegisteredStudentsByModuleCode(myFirstModule.getCode());
    assertEquals(HttpStatus.OK, response.getStatusCode());
  }

  /**
   * Tests the {@link Controller#getMncModules()} method.
   * <p>
   * This test verifies that the method retrieves only the modules marked as "MNC" (Mandatory
   * Non-Credit).
   * </p>
   */
  @Test
  public void testGetMncModule() {
    // Test retrieving MNC modules
    myFirstModule = new Module("TM1", "TestModule1", false);
    myFirstModule.setCode("1");
    mySecondModule = new Module("TM2", "TestModule2", true);
    mySecondModule.setCode("2");
    Mockito.when(moduleRepository.findAll()).thenReturn(List.of(myFirstModule, mySecondModule));

    assertThat(myController.getMncModules()).isEqualTo(List.of(mySecondModule));
  }

  /**
   * Tests the {@link Controller#createStudent(Student)} method for creating a new student.
   * This test verifies that the student is saved in the repository when created.
   */
  @Test
  public void testCreateStudent() {
    // Test creating a student
    Student myFirstStudent =
        createTestStudent(1L, "First", "Student", "firststudent@mail.com", "firststudent1");
    myController.createStudent(myFirstStudent);
    Mockito.verify(studentRepository).save(myFirstStudent);
  }

  /**
   * Tests the {@link Controller#createStudent(Student)} method for a case where the student is
   * automatically registered to an existing MNC module upon creation.
   * <p>
   * This test verifies that the registration process is triggered when a student is created and
   * that the correct interactions with the repository and registration logic occur.
   * </p>
   */
  @Test
  public void testCreateStudentWithMncModule() {
    // Test creating a student with automatic registration to an existing MNC module
    myFirstModule = new Module("TM1", "TestModule1", false);
    myFirstModule.setCode("1");
    mySecondModule = new Module("TM2", "TestModule2", true);
    mySecondModule.setCode("2");
    Mockito.when(moduleRepository.findAll()).thenReturn(List.of(myFirstModule, mySecondModule));

    Student myFirstStudent =
        createTestStudent(1L, "First", "Student", "firststudent@mail.com", "firststudent1");
    Mockito.when(studentRepository.save(myFirstStudent)).thenReturn(myFirstStudent);

    Controller spyController = Mockito.spy(myController);
    ResponseEntity<Student> createdStudent = spyController.createStudent(myFirstStudent);
    Mockito.verify(studentRepository).save(myFirstStudent);
    Mockito.verify(spyController, Mockito.times(1))
        .registerStudent(Mockito.any(Registration.class));
    assertEquals(createdStudent.getBody(), myFirstStudent);
  }

  /**
   * Tests the {@link Controller#getStudentById(Long)} method when the student exists in the
   * database.
   * <p>
   * This test verifies that a successful response is returned (HTTP 200 OK) with the correct
   * student details.
   * </p>
   */
  @Test
  void testGetStudentByIdWhenStudentExists() {
    Student myFirstStudent =
        createTestStudent(1L, "First", "Student", "firststudent@mail.com", "firststudent1");
    Mockito.when(studentRepository.findById(1L)).thenReturn(Optional.of(myFirstStudent));
    assertThat(myController.getStudentById(1L)).isEqualTo(ResponseEntity.ok(myFirstStudent));
  }

  /**
   * Tests the {@link Controller#getStudentById(Long)} method when the student does not exist.
   * <p>
   * This test verifies that the response is HTTP 404 Not Found when the provided ID does not
   * correspond to any student.
   * </p>
   */
  @Test
  void testGetStudentsByIdWhenStudentDoesNotExist() {
    Mockito.when(studentRepository.findById(-1L)).thenReturn(Optional.empty());
    assertThat(myController.getStudentById(-1L)).isEqualTo(ResponseEntity.notFound().build());
  }

  /**
   * Tests the {@link Controller#getStudentById(Long)} method when the student does not exist.
   * <p>
   * This test verifies that the response is HTTP 404 Not Found when the provided ID does not
   * correspond to any student.
   * </p>
   */
  @Test
  void testGetGradesByStudentIdWhenStudentDoesNotExist() {
    Mockito.when(studentRepository.findById(-1L)).thenReturn(Optional.empty());
    assertThat(myController.getGradesByStudentId(-1L)).isEqualTo(ResponseEntity.notFound().build());
  }

  /**
   * Tests the {@link Controller#getGradesByStudentId(Long)} method when the student exists but has
   * no grades assigned.
   * <p>
   * This test verifies that the response is HTTP 404 Not Found in a case where a student is
   * registered but no grades are associated with their records.
   * </p>
   */
  @Test
  void testGetGradesByStudentIdWhenStudentHasNoGrades() {
    Student myFirstStudent =
        createTestStudent(1L, "First", "Student", "firststudent@mail.com", "firststudent1");
    Mockito.when(studentRepository.findById(1L)).thenReturn(Optional.of(myFirstStudent));

    myFirstModule = new Module("TM1", "TestModule1", false);
    myFirstModule.setCode("1");
    mySecondModule = new Module("TM2", "TestModule2", false);
    mySecondModule.setCode("2");
    Mockito.when(moduleRepository.findById("1")).thenReturn(Optional.of(myFirstModule));
    Mockito.when(moduleRepository.findById("2")).thenReturn(Optional.of(mySecondModule));

    Registration myFirstStudentToFirstModuleRegistration =
        new Registration(myFirstStudent, myFirstModule);
    Registration myFirstStudentToSecondModuleRegistration =
        new Registration(myFirstStudent, mySecondModule);
    Mockito.when(registrationRepository.findAll()).thenReturn(
        List.of(myFirstStudentToFirstModuleRegistration, myFirstStudentToSecondModuleRegistration));

    assertThat(myController.getGradesByStudentId(1L)).isEqualTo(ResponseEntity.notFound().build());
  }

  /**
   * Tests the {@link Controller#getGradesByStudentId(Long)} method when the student exists and has
   * grades.
   * <p>
   * This test verifies that all grades for a given student are returned in the response with HTTP
   * 200 OK.
   * </p>
   */
  @Test
  void testGetGradesByStudentIdWhenStudentHasGrades() {
    Student myFirstStudent =
        createTestStudent(1L, "First", "Student", "firststudent@mail.com", "firststudent1");
    Mockito.when(studentRepository.findById(1L)).thenReturn(Optional.of(myFirstStudent));

    myFirstModule = new Module("TM1", "TestModule1", false);
    myFirstModule.setCode("1");
    mySecondModule = new Module("TM2", "TestModule2", false);
    mySecondModule.setCode("2");
    Mockito.when(moduleRepository.findById("1")).thenReturn(Optional.of(myFirstModule));
    Mockito.when(moduleRepository.findById("2")).thenReturn(Optional.of(mySecondModule));

    Registration myFirstStudentToFirstModuleRegistration =
        new Registration(myFirstStudent, myFirstModule);
    Registration myFirstStudentToSecondModuleRegistration =
        new Registration(myFirstStudent, mySecondModule);
    Mockito.when(registrationRepository.findAll()).thenReturn(
        List.of(myFirstStudentToFirstModuleRegistration, myFirstStudentToSecondModuleRegistration));

    Grade firstStudentFirstModuleGrade = new Grade(10, myFirstStudent, myFirstModule);
    Grade firstStudentSecondModuleGrade = new Grade(10, myFirstStudent, mySecondModule);
    myFirstStudent.addGrade(firstStudentFirstModuleGrade);
    myFirstStudent.addGrade(firstStudentSecondModuleGrade);

    assertThat(myController.getGradesByStudentId(1L)).isEqualTo(
        ResponseEntity.ok(List.of(firstStudentFirstModuleGrade, firstStudentSecondModuleGrade)));
  }

  /**
   * Tests the {@link Controller#getGradesByStudentId(Long)} method when the student has a
   * non-matching registration.
   * <p>
   * This test simulates a situation where the provided student exists, but their registration does
   * not match the expected context. The test verifies that no grades are found and HTTP 404 Not
   * Found is returned.
   * </p>
   */
  @Test
  void testGetGradesByStudentIdWithNonMatchingRegistration() {
    Student myFirstStudent =
        createTestStudent(1L, "First", "Student", "firststudent@mail.com", "firststudent1");
    Student mySecondStudent =
        createTestStudent(2L, "Second", "Student", "secondstudent@mail.com", "secondstudent2");

    Registration registration = new Registration();
    registration.setStudent(mySecondStudent);
    Mockito.when(studentRepository.findById(1L)).thenReturn(Optional.of(myFirstStudent));
    Mockito.when(registrationRepository.findAll()).thenReturn(List.of(registration));

    assertEquals(myController.getGradesByStudentId(1L), ResponseEntity.notFound().build());
  }

  /**
   * Tests the {@link Controller#getGradesByModuleCode(String)} method when no valid modules exist.
   * <p>
   * This test verifies the case where the module lookups return no valid entries and the response
   * should return HTTP 404 Not Found. It ensures that the system handles missing context gracefully
   * without any unintended data responses.
   * </p>
   */
  @Test
  void testGradesByModuleCodeWhenNoModules() {
    Student myFirstStudent =
        createTestStudent(1L, "First", "Student", "firststudent@mail.com", "firststudent1");
    Mockito.when(studentRepository.findById(1L)).thenReturn(Optional.of(myFirstStudent));

    Module myFirstModule = new Module("TM1", "TestModule1", false);
    Mockito.when(moduleRepository.findById("TM1")).thenReturn(Optional.of(myFirstModule));

    Registration myFirstStudentToFirstModuleRegistration =
        new Registration(myFirstStudent, myFirstModule);
    Mockito.when(registrationRepository.findAll())
        .thenReturn(List.of(myFirstStudentToFirstModuleRegistration));

    ResponseEntity<List<Grade>> response =
        myController.getGradesByModuleCode(myFirstModule.getCode());

    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);

    assertThat(response.getBody()).isNull();
  }

  /**
   * Tests the {@link Controller#getGrades()} method for retrieving all available grades from the
   * repository.
   * <p>
   * This test verifies that the method successfully returns all entries from the repository and
   * interacts with the repository only once.
   * </p>
   */
  @Test
  void testGetGrades() {
    Student myFirstStudent =
        createTestStudent(1L, "First", "Student", "firststudent@mail.com", "firststudent1");
    Module myFirstModule = new Module("TM1", "TestModule1", false);

    Grade firstStudentFirstModuleGrade = new Grade(10, myFirstStudent, myFirstModule);

    Mockito.when(gradeRepository.findAll()).thenReturn(List.of(firstStudentFirstModuleGrade));

    List<Grade> grades = myController.getGrades();

    assertEquals(1, grades.size());
    assertEquals(firstStudentFirstModuleGrade, grades.get(0));

    Mockito.verify(gradeRepository, Mockito.times(1)).findAll();
  }

  /**
   * Tests the {@link Controller#getModules()} method for retrieving all available modules.
   * <p>
   * This test ensures that the controller interacts correctly with the repository and retrieves the
   * expected number of modules. Additionally, it verifies that the correct repository interaction
   * occurs exactly once.
   * </p>
   */
  @Test
  void testGetModules() {
    Module myFirstModule = new Module("TM1", "TestModule1", false);
    Module mySecondModule = new Module("TM2", "TestModule2", false);

    Mockito.when(moduleRepository.findAll()).thenReturn(List.of(myFirstModule, mySecondModule));

    List<Module> modules = myController.getModules();

    assertEquals(2, modules.size());
    assertEquals(myFirstModule, modules.get(0));
    assertEquals(mySecondModule, modules.get(1));

    Mockito.verify(moduleRepository, Mockito.times(1)).findAll();
  }

  /**
   * Tests the {@link Controller#getRegistrations()} method for retrieving all student-module
   * registrations.
   * <p>
   * This test ensures that all existing registrations are fetched from the repository and returned
   * correctly in the response.
   * </p>
   */
  @Test
  void getRegistrations() {
    Student myFirstStudent =
        createTestStudent(1L, "First", "Student", "firststudent@mail.com", "firststudent1");
    Module myFirstModule = new Module("TM1", "TestModule1", false);
    Registration myFirstStudentToFirstModuleRegistration =
        new Registration(myFirstStudent, myFirstModule);

    Mockito.when(registrationRepository.findAll())
        .thenReturn(List.of(myFirstStudentToFirstModuleRegistration));
    assertEquals(myController.getRegistrations(), List.of(myFirstStudentToFirstModuleRegistration));
  }

  /**
   * Tests the {@link Controller#addGrade(Grade)} method when a grade already exists for a student
   * and module, and when creating a new grade.
   * <p>
   * This test verifies: 1. Updating an existing grade if a record exists for the given student and
   * module combination. 2. Creating a new grade if no prior record is found.
   * </p>
   * <p>
   * It ensures the repository is called correctly for both updating and creating grades and
   * verifies the expected HTTP responses.
   * </p>
   */
  @Test
  void testAddGrade() {
    // Arrange for valid scenarios
    Student myFirstStudent =
        createTestStudent(1L, "First", "Student", "firststudent@mail.com", "firststudent1");
    Module myFirstModule = new Module("TM1", "TestModule1", false);
    Registration myFirstStudentToFirstModuleRegistration =
        new Registration(myFirstStudent, myFirstModule);
    Grade existingGrade = new Grade(80, myFirstStudent, myFirstModule);

    Grade newGrade = new Grade(90, myFirstStudent, myFirstModule);

    // Mock repositories
    Mockito.when(gradeRepository.findByStudentAndModule(myFirstStudent, myFirstModule))
        .thenReturn(Optional.of(existingGrade));

    Mockito.when(gradeRepository.save(existingGrade)).thenReturn(existingGrade);
    Mockito.when(gradeRepository.save(newGrade)).thenReturn(newGrade);

    // branch where there is
    Grade updatedGrade = new Grade(95, myFirstStudent, myFirstModule);
    updatedGrade.setScore(95);

    ResponseEntity<Grade> response = myController.addGrade(updatedGrade);
    assertEquals(HttpStatus.OK, response.getStatusCode());
    assertEquals(95, response.getBody().getScore());

    Mockito.verify(gradeRepository, Mockito.times(1))
        .findByStudentAndModule(myFirstStudent, myFirstModule);
    Mockito.verify(gradeRepository, Mockito.times(1)).save(existingGrade);

    // create new grade
    Mockito.when(gradeRepository.findByStudentAndModule(myFirstStudent, myFirstModule))
        .thenReturn(Optional.empty());

    response = myController.addGrade(newGrade);
    assertEquals(HttpStatus.OK, response.getStatusCode());
    assertEquals(newGrade, response.getBody());

    Mockito.verify(gradeRepository, Mockito.times(1)).save(newGrade);
  }

  /**
   * Tests the {@link Controller#addGrade(Grade)} method with a `null` grade value.
   * <p>
   * This test ensures that the system properly throws a {@link NullPointerException} when provided
   * with invalid or null grade input.
   * </p>
   */
  @Test
  void testAddGradeWithNullGrade() {
    assertThrows(NullPointerException.class, () -> myController.addGrade(null));
  }

  /**
   * Tests the {@link Controller#deleteStudent(Long)} method when attempting to delete a
   * non-existent student.
   * <p>
   * This test verifies that if a student with the given ID does not exist in the repository, the
   * method will return HTTP 404 Not Found as expected.
   * </p>
   */
  @Test
  void testDeleteStudentWhenStudentDoesNotExists() {
    Mockito.when(studentRepository.findById(-1L)).thenReturn(Optional.empty());
    assertThat(myController.deleteStudent(-1L)).isEqualTo(ResponseEntity.notFound().build());
  }

  /**
   * Tests the {@link Controller#deleteStudent(Long)} method for a student that has no associated
   * grades or registrations.
   * <p>
   * This test ensures that a student with no associated data can be successfully deleted without
   * any errors and will return HTTP 204 No Content. It verifies that the repository's delete
   * operation is called as expected.
   * </p>
   */
  @Test
  void testDeleteStudentWithNoGradesAndNoRegistrationsSuccessfully() {
    Student myFirstStudent =
        createTestStudent(1L, "First", "Student", "firststudent@mail.com", "firststudent1");

    Mockito.when(studentRepository.findById(myFirstStudent.getId()))
        .thenReturn(java.util.Optional.of(myFirstStudent));
    Mockito.when(gradeRepository.findByStudentId(myFirstStudent.getId())).thenReturn(List.of());
    Mockito.when(registrationRepository.findByStudentId(myFirstStudent.getId()))
        .thenReturn(List.of());

    ResponseEntity<Void> response = myController.deleteStudent(myFirstStudent.getId());

    assertEquals(204, response.getStatusCodeValue());

    Mockito.verify(studentRepository).delete(myFirstStudent);
  }

  /**
   * Tests the deletion of a student when both grades and registrations are null.
   * <p>
   * This verifies that a student can still be deleted when there are no associated grades or
   * registrations. It ensures the HTTP 204 No Content response is returned, and the repository's
   * delete method is called.
   * </p>
   */
  @Test
  void testDeleteStudentWithNullGradesAndNullRegistrationsSuccessfully() {
    Student myFirstStudent =
        createTestStudent(1L, "First", "Student", "firststudent@mail.com", "firststudent1");

    Mockito.when(studentRepository.findById(myFirstStudent.getId()))
        .thenReturn(java.util.Optional.of(myFirstStudent));
    Mockito.when(gradeRepository.findByStudentId(myFirstStudent.getId())).thenReturn(null);
    Mockito.when(registrationRepository.findByStudentId(myFirstStudent.getId())).thenReturn(null);

    ResponseEntity<Void> response = myController.deleteStudent(myFirstStudent.getId());

    assertEquals(204, response.getStatusCodeValue());

    Mockito.verify(studentRepository).delete(myFirstStudent);
  }

  /**
   * Tests deleting a student successfully when grades and registrations exist.
   * <p>
   * This ensures that: 1. The student's grades and registrations are checked and deleted first. 2.
   * After deletion of these dependencies, the student is successfully deleted. 3. The HTTP 204 No
   * Content response is returned as expected.
   * </p>
   */
  @Test
  void testDeleteStudentWithGradesAndRegistrationsSuccessfully() {
    Student myFirstStudent =
        createTestStudent(1L, "First", "Student", "firststudent@mail.com", "firststudent1");
    Module myFirstModule = new Module("TM1", "TestModule1", false);
    Registration myFirstStudentToFirstModuleRegistration =
        new Registration(myFirstStudent, myFirstModule);
    Grade grade = new Grade(80, myFirstStudent, myFirstModule);

    Mockito.when(studentRepository.findById(myFirstStudent.getId()))
        .thenReturn(java.util.Optional.of(myFirstStudent));
    Mockito.when(gradeRepository.findByStudentId(myFirstStudent.getId()))
        .thenReturn(Arrays.asList(grade));
    Mockito.when(registrationRepository.findByStudentId(myFirstStudent.getId()))
        .thenReturn(Arrays.asList(myFirstStudentToFirstModuleRegistration));

    ResponseEntity<Void> response = myController.deleteStudent(myFirstStudent.getId());

    assertEquals(204, response.getStatusCodeValue());

    Mockito.verify(gradeRepository).deleteAll(Arrays.asList(grade));
    Mockito.verify(registrationRepository)
        .deleteAll(Arrays.asList(myFirstStudentToFirstModuleRegistration));

    Mockito.verify(studentRepository).delete(myFirstStudent);
  }

  /**
   * Tests creating a module without an MNC (Module-Related Student or Condition).
   * <p>
   * This test verifies: 1. The module is created successfully with HTTP 200 OK. 2. No registration
   * is saved when no MNC logic applies.
   * </p>
   */
  @Test
  void testCreateModuleWithoutMnc() {
    Module myFirstModule = new Module("TM1", "TestModule1", false);

    Mockito.when(moduleRepository.save(myFirstModule)).thenReturn(myFirstModule);
    ResponseEntity<Module> response = myController.createModule(myFirstModule);

    assertEquals(200, response.getStatusCodeValue());
    assertEquals(myFirstModule, response.getBody());

    Mockito.verify(registrationRepository, Mockito.never()).save(Mockito.any(Registration.class));
  }

  /**
   * Tests creating a module when MNC is enabled.
   * <p>
   * This verifies that: 1. The module is created successfully with HTTP 200 OK. 2. No registration
   * is saved when MNC is toggled (ensuring no unintended operations).
   * </p>
   */
  @Test
  void testCreateModuleWithMnc() {
    Student myFirstStudent =
        createTestStudent(1L, "First", "Student", "firststudent@mail.com", "firststudent1");
    Module myFirstModule = new Module("TM1", "TestModule1", true);

    Mockito.when(moduleRepository.save(myFirstModule)).thenReturn(myFirstModule);
    Mockito.when(studentRepository.findAll()).thenReturn(Arrays.asList(myFirstStudent));
    ResponseEntity<Module> response = myController.createModule(myFirstModule);

    assertEquals(200, response.getStatusCodeValue());
    assertEquals(myFirstModule, response.getBody());

    Mockito.verify(registrationRepository, Mockito.never()).save(Mockito.any(Registration.class));

  }

  /**
   * Tests attempting to delete a module that does not exist.
   * <p>
   * This ensures the HTTP 404 Not Found response is returned when the module cannot be found in the
   * repository.
   * </p>
   */
  @Test
  void testDeleteModuleWhenModuleDoesNotExists() {
    Mockito.when(moduleRepository.findById("-TM1")).thenReturn(Optional.empty());
    assertThat(myController.deleteModule("-TM1")).isEqualTo(ResponseEntity.notFound().build());
  }

  /**
   * Tests deleting a module that has no grades or registrations linked to it.
   * <p>
   * This verifies: 1. The module is deleted without side effects. 2. The HTTP 204 No Content
   * response is returned. 3. No grade or registration deletion calls are made in this scenario.
   * </p>
   */
  @Test
  void testDeleteModuleWhenNoGradesOrRegistrations() {
    Module module = new Module("TM1", "Test Module 1", false);
    Mockito.when(moduleRepository.findById("TM1")).thenReturn(Optional.of(module));
    Mockito.when(gradeRepository.findByModuleCode("TM1")).thenReturn(Collections.emptyList());
    Mockito.when(registrationRepository.findByModuleCode("TM1"))
        .thenReturn(Collections.emptyList());

    ResponseEntity<Void> response = myController.deleteModule("TM1");

    assertEquals(204, response.getStatusCodeValue()); // 204 No Content
    Mockito.verify(gradeRepository).findByModuleCode("TM1");
    Mockito.verify(registrationRepository).findByModuleCode("TM1");
    Mockito.verify(gradeRepository, Mockito.never()).deleteAll(anyList());
    Mockito.verify(registrationRepository, Mockito.never()).deleteAll(anyList());
    Mockito.verify(moduleRepository).delete(module);
  }

  /**
   * Tests deleting a module when both grades and registrations are null.
   * <p>
   * This verifies that: 1. The module is deleted without side effects or errors. 2. The HTTP 204 No
   * Content response is returned. 3. Grade and registration deletions are skipped.
   * </p>
   */
  @Test
  void testDeleteModuleWhenNullGradesAndNullRegistrations() {
    Module module = new Module("TM1", "Test Module 1", false);
    Mockito.when(moduleRepository.findById("TM1")).thenReturn(Optional.of(module));
    Mockito.when(gradeRepository.findByModuleCode("TM1")).thenReturn(null);
    Mockito.when(registrationRepository.findByModuleCode("TM1")).thenReturn(null);

    ResponseEntity<Void> response = myController.deleteModule("TM1");

    assertEquals(204, response.getStatusCodeValue()); // 204 No Content
    Mockito.verify(gradeRepository).findByModuleCode("TM1");
    Mockito.verify(registrationRepository).findByModuleCode("TM1");
    Mockito.verify(gradeRepository, Mockito.never()).deleteAll(anyList());
    Mockito.verify(registrationRepository, Mockito.never()).deleteAll(anyList());
    Mockito.verify(moduleRepository).delete(module);
  }

  /**
   * Tests deleting a module when grades and registrations exist.
   * <p>
   * This ensures: 1. All associated grades and registrations are deleted. 2. The HTTP 204 No
   * Content response is returned. 3. Repository methods for grade and registration deletions are
   * invoked correctly.
   * </p>
   */
  @Test
  void testDeleteModuleWhenGradesAndRegistrationsExist() {

    Student myFirstStudent =
        createTestStudent(1L, "First", "Student", "firststudent@mail.com", "firststudent1");
    Student mySecondStudent =
        createTestStudent(2L, "Second", "Student", "secondstudent@mail.com", "secondstudent2");
    Mockito.when(studentRepository.findById(1L)).thenReturn(Optional.of(myFirstStudent));
    Mockito.when(studentRepository.findById(2L)).thenReturn(Optional.of(mySecondStudent));

    myFirstModule = new Module("TM1", "TestModule1", false);
    myFirstModule.setCode("1");
    Mockito.when(moduleRepository.findById("1")).thenReturn(Optional.of(myFirstModule));

    Registration myFirstStudentToFirstModuleRegistration =
        new Registration(myFirstStudent, myFirstModule);
    Registration mySecondStudentToFirstModuleRegistration =
        new Registration(mySecondStudent, myFirstModule);
    Mockito.when(registrationRepository.findAll()).thenReturn(
        List.of(myFirstStudentToFirstModuleRegistration, mySecondStudentToFirstModuleRegistration));

    Grade firstStudentFirstModuleGrade = new Grade(10, myFirstStudent, myFirstModule);
    Grade secondStudentFirstModuleGrade = new Grade(10, myFirstStudent, mySecondModule);
    myFirstStudent.addGrade(firstStudentFirstModuleGrade);
    mySecondStudent.addGrade(secondStudentFirstModuleGrade);


    Mockito.when(moduleRepository.findById("TM1")).thenReturn(Optional.of(myFirstModule));
    Mockito.when(gradeRepository.findByModuleCode("TM1"))
        .thenReturn(List.of(firstStudentFirstModuleGrade, secondStudentFirstModuleGrade));
    Mockito.when(registrationRepository.findByModuleCode("TM1")).thenReturn(
        List.of(myFirstStudentToFirstModuleRegistration, mySecondStudentToFirstModuleRegistration));

    ResponseEntity<Void> response = myController.deleteModule("TM1");

    assertEquals(204, response.getStatusCodeValue()); // 204 No Content
    Mockito.verify(gradeRepository).findByModuleCode("TM1");
    Mockito.verify(registrationRepository).findByModuleCode("TM1");
    Mockito.verify(gradeRepository)
        .deleteAll(List.of(firstStudentFirstModuleGrade, secondStudentFirstModuleGrade));
    Mockito.verify(registrationRepository).deleteAll(
        List.of(myFirstStudentToFirstModuleRegistration, mySecondStudentToFirstModuleRegistration));
    Mockito.verify(moduleRepository).delete(myFirstModule);
  }

  /**
   * Tests deleting a registration when valid associations exist.
   * <p>
   * This ensures: 1. The registration is deleted successfully. 2. All associated grades for the
   * registration are deleted, as expected. 3. The HTTP 204 No Content response is returned.
   * </p>
   */
  @Test
  void testDeleteRegistration() {
    Student myFirstStudent =
        createTestStudent(1L, "First", "Student", "firststudent@mail.com", "firststudent1");
    Module myFirstModule = new Module("TM1", "TestModule1", false);
    Registration myFirstStudentToFirstModuleRegistration =
        new Registration(myFirstStudent, myFirstModule);
    Grade firstStudentFirstModuleGrade = new Grade(10, myFirstStudent, myFirstModule);

    Mockito.when(registrationRepository.findByStudentIdAndModuleCode(1L, "TM1"))
        .thenReturn(myFirstStudentToFirstModuleRegistration);
    Mockito.when(gradeRepository.findByStudentIdAndModuleCode(1L, "TM1"))
        .thenReturn(List.of(firstStudentFirstModuleGrade));

    assertThat(myController.deleteRegistration(1L, "TM1")).isEqualTo(
        ResponseEntity.noContent().build());
    Mockito.verify(registrationRepository).delete(myFirstStudentToFirstModuleRegistration);
    Mockito.verify(gradeRepository).deleteAll(List.of(firstStudentFirstModuleGrade));
  }

  /**
   * Tests attempting to delete a null registration.
   * <p>
   * This ensures that when no registration is found, the HTTP 404 Not Found response is returned.
   * </p>
   */
  @Test
  void testDeleteNullRegistration() {
    Mockito.when(registrationRepository.findByStudentIdAndModuleCode(1L, "TM1")).thenReturn(null);
    assertThat(myController.deleteRegistration(1L, "TM1")).isEqualTo(
        ResponseEntity.notFound().build());
  }

  /**
   * Tests deleting a registration when no grades are associated.
   * <p>
   * This ensures: 1. The registration is deleted successfully. 2. No grades are found and no
   * additional operations fail. 3. The HTTP 204 No Content response is returned as expected.
   * </p>
   */
  @Test
  void testDeleteRegistrationWithNullGrades() {
    Student myFirstStudent =
        createTestStudent(1L, "First", "Student", "firststudent@mail.com", "firststudent1");
    Module myFirstModule = new Module("TM1", "TestModule1", false);
    Registration myFirstStudentToFirstModuleRegistration =
        new Registration(myFirstStudent, myFirstModule);

    Mockito.when(registrationRepository.findByStudentIdAndModuleCode(1L, "TM1"))
        .thenReturn(myFirstStudentToFirstModuleRegistration);
    Mockito.when(gradeRepository.findByStudentIdAndModuleCode(1L, "TM1")).thenReturn(null);

    assertThat(myController.deleteRegistration(1L, "TM1")).isEqualTo(
        ResponseEntity.noContent().build());
    Mockito.verify(registrationRepository).delete(myFirstStudentToFirstModuleRegistration);
  }

  /**
   * Tests deleting a registration when no associated grades are linked.
   * <p>
   * This ensures: 1. The registration is deleted successfully. 2. The HTTP 204 No Content response
   * is returned.
   * </p>
   */
  @Test
  void testDeleteRegistrationWithEmptyGrades() {
    Student myFirstStudent =
        createTestStudent(1L, "First", "Student", "firststudent@mail.com", "firststudent1");
    Module myFirstModule = new Module("TM1", "TestModule1", false);
    Registration myFirstStudentToFirstModuleRegistration =
        new Registration(myFirstStudent, myFirstModule);

    Mockito.when(registrationRepository.findByStudentIdAndModuleCode(1L, "TM1"))
        .thenReturn(myFirstStudentToFirstModuleRegistration);
    Mockito.when(gradeRepository.findByStudentIdAndModuleCode(1L, "TM1")).thenReturn(List.of());

    assertThat(myController.deleteRegistration(1L, "TM1")).isEqualTo(
        ResponseEntity.noContent().build());
    Mockito.verify(registrationRepository).delete(myFirstStudentToFirstModuleRegistration);
  }

  /**
   * Tests retrieving registered modules by a given student ID.
   * <p>
   * This verifies: 1. When valid registrations exist, the response returns the expected modules
   * with HTTP 200 OK. 2. The retrieved modules correspond to the student's registrations.
   * </p>
   */
  @Test
  void testGetRegisteredModulesByStudentId() {
    Student myFirstStudent =
        createTestStudent(1L, "First", "Student", "firststudent@mail.com", "firststudent1");
    Module myFirstModule = new Module("TM1", "TestModule1", false);
    Module mySecondModule = new Module("TM2", "TestModule2", false);
    Registration myFirstStudentToFirstModuleRegistration =
        new Registration(myFirstStudent, myFirstModule);
    Registration myFirstStudentToSecondModuleRegistration =
        new Registration(myFirstStudent, mySecondModule);

    Mockito.when(studentRepository.findById(1L)).thenReturn(Optional.of(myFirstStudent));
    Mockito.when(registrationRepository.findByStudentId(1L)).thenReturn(
        List.of(myFirstStudentToFirstModuleRegistration, myFirstStudentToSecondModuleRegistration));

    assertThat(myController.getRegisteredModulesByStudentId(1L)).isEqualTo(
        ResponseEntity.ok(List.of(myFirstModule, mySecondModule)));
  }

  /**
   * Tests attempting to retrieve registered modules for a non-existent student.
   * <p>
   * This ensures that the system returns HTTP 404 Not Found when no matching student exists.
   * </p>
   */
  @Test
  void testGetRegisteredModulesByStudentIdWhenStudentNotFound() {
    Mockito.when(moduleRepository.findById("1")).thenReturn(null);
    assertThat(myController.getRegisteredModulesByStudentId(1L)).isEqualTo(
        ResponseEntity.notFound().build());
  }

  /**
   * Tests retrieving registered modules when no modules exist for a valid student.
   * <p>
   * This ensures: 1. The response is successful. 2. The returned list is empty, with HTTP 200 OK.
   * </p>
   */
  @Test
  void testGetRegisteredModulesByStudentIdWithNoModule() {
    Student myFirstStudent =
        createTestStudent(1L, "First", "Student", "firststudent@mail.com", "firststudent1");
    Mockito.when(studentRepository.findById(1L)).thenReturn(Optional.of(myFirstStudent));
    Mockito.when(registrationRepository.findByStudentId(1L)).thenReturn(List.of());
    assertThat(myController.getRegisteredModulesByStudentId(1L)).isEqualTo(
        ResponseEntity.ok(List.of()));
  }

  /**
   * Tests retrieving registered modules when null responses are returned by the repository.
   * <p> This verifies:
   * 1. The response returns HTTP 200 OK with an empty list when nulls are encountered instead of
   * valid data.</p>
   */
  @Test
  void testGetRegisteredModulesByStudentIdWithNullModule() {
    Student myFirstStudent =
        createTestStudent(1L, "First", "Student", "firststudent@mail.com", "firststudent1");

    Mockito.when(studentRepository.findById(1L)).thenReturn(Optional.of(myFirstStudent));
    Mockito.when(registrationRepository.findByStudentId(1L)).thenReturn(null);

    assertThat(myController.getRegisteredModulesByStudentId(1L)).isEqualTo(
        ResponseEntity.ok(List.of()));
  }


}
