package uk.ac.ucl.comp0010.registration;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository interface for managing {@link Registration} entities.
 * This interface extends {@link JpaRepository} to provide CRUD operations for the
 * {@link Registration} entity. Additionally, it defines custom query methods for specific
 * operations related to student and module associations.
 */
@Repository
public interface RegistrationRepository extends JpaRepository<Registration, Long> {

  /**
   * Checks if a registration exists for a given student and module.
   *
   * @param studentId the ID of the student.
   * @param moduleId  the code of the module.
   * @return {@code true} if a registration exists for the specified student and module;
   *         {@code false} otherwise.
   */
  boolean existsByStudentIdAndModuleCode(Long studentId, String moduleId);

  /**
   * Finds all registrations associated with a specific student.
   *
   * @param studentId the ID of the student.
   * @return a list of {@link Registration} entities for the specified student.
   */
  List<Registration> findByStudentId(Long studentId);

  /**
   * Finds all registrations associated with a specific module.
   *
   * @param moduleId the code of the module.
   * @return a list of {@link Registration} entities for the specified module.
   */
  List<Registration> findByModuleCode(String moduleId);

  /**
   * Retrieves a specific registration for a given student and module.
   *
   * @param studentId the ID of the student.
   * @param moduleId  the code of the module.
   * @return the {@link Registration} entity for the specified student and module, or {@code null}
   *         if not found.
   */
  Registration findByStudentIdAndModuleCode(Long studentId, String moduleId);

}
