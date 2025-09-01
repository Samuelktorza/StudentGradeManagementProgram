package uk.ac.ucl.comp0010.module;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository interface for managing {@link Module} entities.
 * Provides CRUD operations for the Module entity by extending {@link JpaRepository}. The primary
 * key for the Module entity is of type {@link String}, representing the module code.
 */
@Repository
public interface ModuleRepository extends JpaRepository<Module, String> {
}
