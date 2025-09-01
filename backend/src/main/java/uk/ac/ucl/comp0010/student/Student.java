package uk.ac.ucl.comp0010.student;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import uk.ac.ucl.comp0010.grade.Grade;
import uk.ac.ucl.comp0010.module.Module;

import java.util.ArrayList;
import java.util.List;

/**
 * Represents a student with personal details and associated grades.
 * A student has an ID, first name, last name, username, and email address. Additionally, the
 * student maintains a list of grades for modules they are enrolled in. This class provides methods
 * to manage grades and compute the student's average score.
 */
@Entity
public class Student {

  /**
   * Default constructor for Student.
   */
  public Student() {
  }

  /**
   * The unique identifier for the student.
   */
  @Id
  private Long id;
  /**
   * The first name of the student.
   */
  private String firstName;
  /**
   * The last name of the student.
   */
  private String lastName;

  /**
   * The username of the student, typically used for login or identification.
   */
  private String username;

  /**
   * The email address of the student.
   */
  private String email;

  /**
   * The list of grades associated with this student.
   * This is a one-to-many relationship where a student can have multiple grades. The relationship
   * is managed by the {@link Grade} entity. The grades are ignored in JSON serialization to prevent
   * infinite recursion.
   */
  @OneToMany(mappedBy = "student")
  private List<Grade> grades = new ArrayList<>();

  /**
   * Computes the average score of the student's grades.
   *
   * @return the average score, or 0 if there are no grades.
   */
  public Double computeAverage() {
    if (grades.isEmpty()) {
      return (Double) 0.0;
    }
    return (Double) grades.stream().mapToInt(Grade::getScore).average().orElse(0f);
  }

  /**
   * Adds a grade to the student's list of grades. Also sets the student reference in the grade.
   *
   * @param grade the grade to add.
   */
  public void addGrade(Grade grade) {
    grades.add(grade);
    grade.setStudent(this); // Setting the back reference
  }

  /**
   * Finds a grade associated with a specific module.
   *
   * @param module the {@link Module} to search for in the student's grades.
   * @return the {@link Grade} for the specified module, or {@code null} if no grade is found.
   */
  public Grade getGradeByModule(Module module) {
    for (Grade grade : grades) {
      if (grade.getModule().equals(module)) {
        return grade;
      }
    }
    return null;
  }

  /**
   * Returns a string representation of the student for debugging purposes.
   *
   * @return a string containing the student's ID, name, username, email, and grades.
   */
  @Override
  public String toString() {
    return "Student{"
        + "id=" + id
        + ", firstName='" + firstName + '\''
        + ", lastName='" + lastName + '\''
        + ", username='" + username + '\''
        + ", email='" + email + '\''
        + ", grades=" + grades
        + '}';
  }

  /**
   * Gets the unique identifier for the student.
   *
   * @return the student's ID.
   */
  public Long getId() {
    return id;
  }

  /**
   * Sets the unique identifier for the student.
   *
   * @param id the new ID for the student.
   */
  public void setId(Long id) {
    this.id = id;
  }

  /**
   * Gets the first name of the student.
   *
   * @return the student's first name.
   */
  public String getFirstName() {
    return firstName;
  }

  /**
   * Sets the first name of the student.
   *
   * @param firstName the new first name of the student.
   */
  public void setFirstName(String firstName) {
    this.firstName = firstName;
  }

  /**
   * Gets the last name of the student.
   *
   * @return the student's last name.
   */
  public String getLastName() {
    return lastName;
  }

  /**
   * Sets the last name of the student.
   *
   * @param lastName the new last name of the student.
   */
  public void setLastName(String lastName) {
    this.lastName = lastName;
  }

  /**
   * Gets the username of the student.
   *
   * @return the student's username.
   */
  public String getUsername() {
    return username;
  }

  /**
   * Sets the username of the student.
   *
   * @param username the new username for the student.
   */
  public void setUsername(String username) {
    this.username = username;
  }

  /**
   * Gets the email address of the student.
   *
   * @return the student's email address.
   */
  public String getEmail() {
    return email;
  }

  /**
   * Sets the email address of the student.
   *
   * @param email the new email address for the student.
   */
  public void setEmail(String email) {
    this.email = email;
  }

}
