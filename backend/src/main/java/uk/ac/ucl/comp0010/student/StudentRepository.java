package uk.ac.ucl.comp0010.student;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository interface for managing {@link Student} entities.
 * This interface extends {@link JpaRepository} to provide CRUD operations for the {@link Student}
 * entity.
 */

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
}
