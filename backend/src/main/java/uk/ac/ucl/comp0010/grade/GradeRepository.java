package uk.ac.ucl.comp0010.grade;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uk.ac.ucl.comp0010.module.Module;
import uk.ac.ucl.comp0010.student.Student;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for managing {@link Grade} entities.
 * This interface provides database access methods for performing CRUD operations and custom queries
 * on the {@link Grade} entity. It extends {@link JpaRepository}, which provides built-in methods
 * for standard operations such as saving, deleting, and finding entities.
 */
@Repository
public interface GradeRepository extends JpaRepository<Grade, Long> {
  /**
   * Finds a grade by the associated student and module.
   *
   * @param student the student associated with the grade.
   * @param module  the module associated with the grade.
   * @return an {@link Optional} containing the grade if found, or empty otherwise.
   */
  Optional<Grade> findByStudentAndModule(Student student, Module module);

  /**
   * Finds all grades for a specific student by their ID.
   *
   * @param studentId the ID of the student whose grades are to be retrieved.
   * @return a {@link List} of grades associated with the specified student ID.
   */
  List<Grade> findByStudentId(Long studentId);

  /**
   * Finds all grades for a specific module by its code.
   *
   * @param code the unique code of the module whose grades are to be retrieved.
   * @return a {@link List} of grades associated with the specified module code.
   */
  List<Grade> findByModuleCode(String code);

  /**
   * Finds grades for a specific student in a specific module.
   *
   * @param studentId the ID of the student.
   * @param code      the code of the module.
   * @return a {@link List} of grades for the specified student and module combination.
   */
  List<Grade> findByStudentIdAndModuleCode(Long studentId, String code);
}
