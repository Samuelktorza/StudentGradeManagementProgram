package uk.ac.ucl.comp0010.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import uk.ac.ucl.comp0010.grade.Grade;
import uk.ac.ucl.comp0010.grade.GradeRepository;
import uk.ac.ucl.comp0010.module.Module;
import uk.ac.ucl.comp0010.module.ModuleRepository;
import uk.ac.ucl.comp0010.registration.Registration;
import uk.ac.ucl.comp0010.registration.RegistrationRepository;
import uk.ac.ucl.comp0010.student.Student;
import uk.ac.ucl.comp0010.student.StudentRepository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * Controller class for managing HTTP requests related to students, modules, grades, and
 * registrations.
 *
 * <p>This class provides endpoints to perform CRUD operations and retrieve
 * specific information from the database using various repositories.</p>
 */
@CrossOrigin(origins = "http://localhost:5173")
@RestController
public class Controller {

  /**
   * Default constructor for Controller.
   */
  public Controller() {
  }

  /**
   * The repository interface for managing Student entities. Provides CRUD operations for Student
   * objects.
   */
  @Autowired
  private StudentRepository studentRepository;

  /**
   * The repository interface for managing Module entities. Provides CRUD operations for Module
   * objects.
   */
  @Autowired
  private ModuleRepository moduleRepository;

  /**
   * The repository interface for managing Grade entities. Provides CRUD operations for Grade
   * objects.
   */
  @Autowired
  private GradeRepository gradeRepository;

  /**
   * The repository interface for managing Registration entities. Provides CRUD operations for
   * Registration objects.
   */
  @Autowired
  private RegistrationRepository registrationRepository;

  // Add endpoints for Students, Modules, Grades, and Registrations

  /**
   * Retrieves a list of all students.
   *
   * @return a list of all students in the database.
   */
  @GetMapping("/students")
  public List<Student> getStudents() {
    return studentRepository.findAll();
  }

  /**
   * Retrieves a specific student by their ID.
   *
   * @param id the ID of the student to retrieve.
   * @return a ResponseEntity containing the student if found, or 404 if not found.
   */
  @GetMapping("/students/{id}")
  public ResponseEntity<Student> getStudentById(@PathVariable Long id) {
    // Retrieve the student by ID
    Student student = studentRepository.findById(id).orElse(null);

    if (student == null) {
      return ResponseEntity.notFound().build();  // If no student found, return 404
    }

    return ResponseEntity.ok(student);  // Return the student data with a 200 OK
  }

  /**
   * Deletes a student by their ID along with all related grades and registrations.
   *
   * @param id the ID of the student to delete.
   * @return a ResponseEntity with 204 No Content if successful, or 404 if the student does not
   *         exist.
   */
  @DeleteMapping("/students/{id}")
  public ResponseEntity<Void> deleteStudent(@PathVariable Long id) {
    // Check if the student exists
    Student student = studentRepository.findById(id).orElse(null);
    if (student == null) {
      return ResponseEntity.notFound().build();  // Return 404 if student doesn't exist
    }

    // Delete all grades related to the student
    List<Grade> grades = gradeRepository.findByStudentId(id);  // Fetch all grades for the student
    if (grades != null && !grades.isEmpty()) {
      gradeRepository.deleteAll(grades);  // Delete all grades for the student
    }

    // Delete all registrations related to the student
    List<Registration> registrations =
        registrationRepository.findByStudentId(id);  // Fetch all registrations for the student
    if (registrations != null && !registrations.isEmpty()) {
      registrationRepository.deleteAll(registrations);  // Delete all registrations for the student
    }

    // Delete the student
    studentRepository.delete(student);
    return ResponseEntity.noContent().build();  // Return 204 No Content on success
  }

  /**
   * Retrieves all modules marked as "Mandatory for New Courses" (MNC).
   *
   * @return a list of MNC modules.
   */
  public List<Module> getMncModules() {
    List<Module> modules = moduleRepository.findAll();
    List<Module> mncModules = new ArrayList<>();
    for (Module module : modules) {
      if (module.isMnc()) {
        mncModules.add(module);
      }
    }
    return mncModules;
  }

  /**
   * Creates a new student and automatically registers them for all MNC modules.
   *
   * @param student the student to create.
   * @return a ResponseEntity containing the created student.
   */
  @PostMapping("/students")
  public ResponseEntity<Student> createStudent(@RequestBody Student student) {
    Student savedStudent = studentRepository.save(student);
    System.out.println("Received Student: " + student);

    List<Module> mncModules = getMncModules();
    for (Module module : mncModules) {
      Registration registration = new Registration(savedStudent, module);
      registerStudent(registration);
    }

    return ResponseEntity.ok(savedStudent);
  }

  /**
   * Retrieves all grades for a specific student by their ID.
   *
   * @param id the ID of the student.
   * @return a ResponseEntity containing a list of grades, or 404 if no grades are found.
   */
  @GetMapping("/students/{id}/grades")
  public ResponseEntity<List<Grade>> getGradesByStudentId(@PathVariable Long id) {
    // Retrieve the student by ID
    Student student = studentRepository.findById(id).orElse(null);

    if (student == null) {
      return ResponseEntity.notFound().build();  // If no student found, return 404
    }

    // Fetch all registrations and filter them by the given student
    List<Registration> registrations = registrationRepository.findAll();
    List<Grade> studentGrades = new ArrayList<>();

    for (Registration registration : registrations) {
      if (registration.getStudent().getId().equals(id)) {
        Module module = registration.getModule();
        Grade grade = student.getGradeByModule(module);  // Fetch the grade for this module

        if (grade != null) {
          // Add the grade to the list if it exists
          studentGrades.add(grade);
        }
      }
    }

    // If no grades found, return 404
    if (studentGrades.isEmpty()) {
      return ResponseEntity.notFound().build();
    }

    // Return the list of grades for the student
    return ResponseEntity.ok(studentGrades);
  }

  /**
   * Retrieves all grades for a specific module by its code.
   *
   * @param code the code of the module.
   * @return a ResponseEntity containing a list of grades, or 404 if no grades are found.
   */
  @GetMapping("/modules/{code}/grades")
  public ResponseEntity<List<Grade>> getGradesByModuleCode(@PathVariable String code) {
    // Retrieve the module by ID
    Module module = moduleRepository.findById(code).orElse(null);

    if (module == null) {
      return ResponseEntity.notFound().build();  // If no student found, return 404
    }

    // Fetch all registrations and filter them by the given module
    List<Registration> registrations = registrationRepository.findAll();
    List<Grade> moduleGrades = new ArrayList<>();

    for (Registration registration : registrations) {
      if (registration.getModule().getCode().equals(code)) {
        Student student = registration.getStudent();
        Grade grade = student.getGradeByModule(module);  // Fetch the grade for this module

        if (grade != null) {
          // Add the grade to the list if it exists
          moduleGrades.add(grade);
        }
      }
    }

    // If no grades found, return 404
    if (moduleGrades.isEmpty()) {
      return ResponseEntity.notFound().build();
    }

    // Return the list of grades for the student
    return ResponseEntity.ok(moduleGrades);
  }

  /**
   * Retrieves all modules.
   *
   * @return a list of all modules in the database.
   */
  @GetMapping("/modules")
  public List<Module> getModules() {
    return moduleRepository.findAll();
  }

  /**
   * Creates a new module and automatically registers all existing students if it is marked as MNC.
   *
   * @param module the module to create.
   * @return a ResponseEntity containing the created module.
   */
  @PostMapping("/modules")
  public ResponseEntity<Module> createModule(@RequestBody Module module) {
    Module savedModule = moduleRepository.save(module);
    if (module.isMnc()) {
      for (Student student : studentRepository.findAll()) {
        Registration registration = new Registration(student, module);
        registerStudent(registration);
      }
    }
    return ResponseEntity.ok(savedModule);
  }

  /**
   * Deletes a module by its code, along with all related grades and registrations.
   *
   * @param code the code of the module to delete.
   * @return a ResponseEntity with 204 No Content if successful, or 404 if the module does not
   *         exist.
   */
  @DeleteMapping("/modules/{code}")
  public ResponseEntity<Void> deleteModule(@PathVariable String code) {
    // Check if the module exists
    Module module = moduleRepository.findById(code).orElse(null);
    if (module == null) {
      return ResponseEntity.notFound().build();  // Return 404 if module doesn't exist
    }

    // Delete all grades related to the module
    List<Grade> grades = gradeRepository.findByModuleCode(code);  // Fetch all grades for the module
    if (grades != null && !grades.isEmpty()) {
      gradeRepository.deleteAll(grades);  // Delete all grades for the module
    }

    // Delete all registrations related to the module
    List<Registration> registrations =
        registrationRepository.findByModuleCode(code);  // Fetch all registrations for the module
    if (registrations != null && !registrations.isEmpty()) {
      registrationRepository.deleteAll(registrations);  // Delete all registrations for the module
    }

    // Delete the module
    moduleRepository.delete(module);
    return ResponseEntity.noContent().build();  // Return 204 No Content on success
  }

  /**
   * Retrieves all grades.
   *
   * @return a list of all grades in the database.
   */
  @GetMapping("/grades")
  public List<Grade> getGrades() {
    return gradeRepository.findAll();
  }

  /**
   * Adds or updates a grade for a student and module.
   *
   * @param grade the grade to add or update.
   * @return a ResponseEntity containing the created or updated grade.
   */
  @PostMapping("/grades")
  public ResponseEntity<Grade> addGrade(@RequestBody Grade grade) {

    // Check if a Grade already exists for the given student and module
    Optional<Grade> existingGrade =
        gradeRepository.findByStudentAndModule(grade.getStudent(), grade.getModule());

    if (existingGrade.isPresent()) {
      // If exists, update the existing Grade's score (or other fields if necessary)
      Grade foundGrade = existingGrade.get();
      foundGrade.setScore(grade.getScore()); // Update score
      gradeRepository.save(foundGrade); // Save updated grade
      return ResponseEntity.ok(foundGrade);
    }

    // If not found, save as a new Grade
    Grade savedGrade = gradeRepository.save(grade);
    return ResponseEntity.ok(savedGrade);
  }

  /**
   * Retrieves all registrations.
   *
   * @return a list of all registrations in the database.
   */
  @GetMapping("/registrations")
  public List<Registration> getRegistrations() {
    return registrationRepository.findAll();
  }

  /**
   * Creates a new registration for a student in a module.
   *
   * @param registration the registration to create.
   * @return a ResponseEntity containing the created registration, or an error message if the
   *         registration is invalid.
   */
  @PostMapping("/registrations")
  public ResponseEntity<?> registerStudent(@RequestBody Registration registration) {
    // Fetch the module by its code
    Module module = moduleRepository.findById(registration.getModule().getCode()).orElse(null);

    if (module == null) {
      return ResponseEntity.badRequest().body("Invalid module ID provided.");
    }

    registration.setModule(module);

    // Check if the registration already exists
    boolean registrationExists =
        registrationRepository.existsByStudentIdAndModuleCode(registration.getStudent().getId(),
            registration.getModule().getCode());

    if (registrationExists) {
      return ResponseEntity.badRequest().body("This registration already exists.");
    }

    // Save the registration
    Registration savedRegistration = registrationRepository.save(registration);
    return ResponseEntity.ok(savedRegistration);
  }


  /**
   * Deletes a specific registration for a student in a module, along with any related grades.
   *
   * @param studentId the ID of the student whose registration is to be deleted
   * @param moduleId  the code of the module for which the registration is to be deleted
   * @return a ResponseEntity indicating the outcome of the operation: - 204 No Content if
   *         successful - 404 Not Found if the registration does not exist
   */
  @DeleteMapping("/registrations/{student_id}/{module_id}")
  public ResponseEntity<Void> deleteRegistration(@PathVariable Long studentId,
      @PathVariable String moduleId) {
    // Check if the module exists
    Registration registration =
        registrationRepository.findByStudentIdAndModuleCode(studentId, moduleId);
    if (registration == null) {
      return ResponseEntity.notFound().build();  // Return 404 if module doesn't exist
    }

    // Delete any grades
    List<Grade> grades = gradeRepository.findByStudentIdAndModuleCode(studentId, moduleId);
    if (grades != null && !grades.isEmpty()) {
      gradeRepository.deleteAll(grades);  // Delete all grades for the student
    }

    // Delete the registration
    registrationRepository.delete(registration);
    return ResponseEntity.noContent().build();  // Return 204 No Content on success
  }

  /**
   * Retrieves a list of all students registered in a specific module.
   *
   * @param code the code of the module for which to retrieve registered students
   * @return a ResponseEntity containing the list of registered students: - 200 OK with the list of
   *         students if successful - 404 Not Found if the module does not exist
   */
  @GetMapping("/modules/{code}/students")
  public ResponseEntity<List<Student>> getRegisteredStudentsByModuleCode(
      @PathVariable String code) {
    // Retrieve the module by ID
    Module module = moduleRepository.findById(code).orElse(null);

    if (module == null) {
      return ResponseEntity.notFound().build();  // If no student found, return 404
    }

    // Fetch all registrations and filter them by the given module
    List<Registration> registrations = registrationRepository.findAll();
    List<Student> moduleStudents = new ArrayList<>();

    for (Registration registration : registrations) {
      if (registration.getModule().getCode().equals(code)) {
        Student student = registration.getStudent();
        moduleStudents.add(student);
      }
    }

    // Return the list of grades for the student
    return ResponseEntity.ok(moduleStudents);
  }

  /**
   * Retrieves a list of all modules in which a specific student is registered.
   *
   * @param id the ID of the student for whom to retrieve registered modules
   * @return a ResponseEntity containing the list of registered modules: - 200 OK with the list of
   *         modules if successful - 404 Not Found if the student does not exist
   */
  @GetMapping("/students/{id}/modules")
  public ResponseEntity<List<Module>> getRegisteredModulesByStudentId(@PathVariable Long id) {
    // Check if the student exists
    Student student = studentRepository.findById(id).orElse(null);
    if (student == null) {
      return ResponseEntity.notFound().build(); // Return 404 if student doesn't exist
    }

    // Fetch all registrations for the given student ID
    List<Registration> registrations = registrationRepository.findByStudentId(id);
    if (registrations == null || registrations.isEmpty()) {
      return ResponseEntity.ok(new ArrayList<>()); // Return an empty list if no registrations
    }

    // Extract the list of modules from the registrations
    List<Module> registeredModules = new ArrayList<>();
    for (Registration registration : registrations) {
      registeredModules.add(registration.getModule());
    }

    // Return the list of modules
    return ResponseEntity.ok(registeredModules);
  }

}
