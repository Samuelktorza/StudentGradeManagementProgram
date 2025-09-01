package uk.ac.ucl.comp0010.module;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import uk.ac.ucl.comp0010.grade.Grade;

import java.util.ArrayList;
import java.util.List;

/**
 * Represents a module within the grading system.
 * A module contains a code, name, and a boolean indicating whether it is an MNC (Mandatory or
 * Non-Compulsory) module. It also maintains a list of grades associated with it.
 */
@Entity
public class Module {

  /**
   * The unique code of the module. Serves as the primary identifier for the module.
   */
  @Id
  private String code;

  /**
   * The name of the module.
   */
  private String name;

  /**
   * Indicates whether the module is marked as MNC (Mandatory or Non-Compulsory).
   */
  private boolean mnc;

  /**
   * The list of grades associated with this module.
   * This is a one-to-many relationship where a module can have multiple grades. The relationship is
   * managed by the {@link Grade} entity. The grades are ignored in JSON serialization to prevent
   * infinite recursion.
   */
  @OneToMany(mappedBy = "module", cascade = CascadeType.ALL)
  @JsonIgnore
  private List<Grade> grades = new ArrayList<>();

  /**
   * Default constructor required by JPA.
   */
  public Module() {
  }

  /**
   * Constructs a new Module with the specified code, name, and MNC status.
   *
   * @param code the unique code of the module.
   * @param name the name of the module.
   * @param mnc  whether the module is part of the MNC.
   */
  public Module(String code, String name, boolean mnc) {
    this.code = code;
    this.name = name;
    this.mnc = mnc;
  }

  /**
   * Gets the unique code of the module.
   *
   * @return the code of the module.
   */
  public String getCode() {
    return code;
  }

  /**
   * Sets the unique code of the module.
   *
   * @param code the new code of the module.
   */
  public void setCode(String code) {
    this.code = code;
  }

  /**
   * Gets the name of the module.
   *
   * @return the name of the module.
   */
  public String getName() {
    return name;
  }

  /**
   * Sets the name of the module.
   *
   * @param name the new name of the module.
   */
  public void setName(String name) {
    this.name = name;
  }

  /**
   * Checks if the module is marked as MNC (Mandatory or Non-Compulsory).
   *
   * @return {@code true} if the module is MNC; {@code false} otherwise.
   */
  public boolean isMnc() {
    return mnc;
  }

  /**
   * Sets the MNC status of the module.
   *
   * @param mnc {@code true} to mark the module as MNC; {@code false} otherwise.
   */
  public void setMnc(boolean mnc) {
    this.mnc = mnc;
  }

  /**
   * Gets the list of grades associated with this module.
   *
   * @return a list of {@link Grade} entities associated with this module.
   */
  public List<Grade> getGrades() {
    return grades;
  }

  /**
   * Sets the list of grades associated with this module.
   *
   * @param grades the new list of {@link Grade} entities to associate with this module.
   */
  public void setGrades(List<Grade> grades) {
    this.grades = grades;
  }

  /**
   * Returns a string representation of the module for debugging purposes.
   *
   * @return a string representation of the module.
   */
  @Override
  public String toString() {
    return "Module{"
        + ", code='" + code + '\''
        + ", name='" + name + '\''
        + ", mnc=" + mnc
        + ", grades=" + grades
        + '}';
  }
}
