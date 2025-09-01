package uk.ac.ucl.comp0010;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Main class for the application.
 * This class contains the main method to run the Spring Boot application.
 */

@SpringBootApplication
public class Group03Application {

  /**
   * Default constructor for Group03Application.
   */
  public Group03Application() {
  }

  /**
   * Main method to run the Spring Boot application.
   *
   * @param args The command line arguments passed to the application.
   */
  public static void main(String[] args) {
    SpringApplication.run(Group03Application.class, args);
  }

}
