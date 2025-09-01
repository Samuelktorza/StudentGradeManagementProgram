package uk.ac.ucl.comp0010;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Configuration class for enabling CORS (Cross-Origin Resource Sharing) in the application.
 * This class implements {@link WebMvcConfigurer} to provide custom CORS configuration for the
 * application.
 */
@Configuration
public class CorsConfig implements WebMvcConfigurer {

  /**
   * Default constructor for CorsConfig.
   */
  public CorsConfig() {
  }

  /**
   * Adds CORS mappings to the specified registry.
   * This method allows requests from the specified origin (http://localhost:5173) and allows the
   * specified methods, headers, and credentials for CORS requests.
   *
   * @param registry the CORS registry to which mappings are added.
   */
  @Override
  public void addCorsMappings(CorsRegistry registry) {
    registry.addMapping("/**").allowedOrigins("http://localhost:5173")
        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS").allowedHeaders("*")
        .allowCredentials(true);
  }
}

