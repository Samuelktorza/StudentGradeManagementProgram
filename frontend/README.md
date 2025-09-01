# Student Grade Management Program

## Description
Best project in COMP0010 b far...

## Installation
1. go to frontend on command line
2. run "npm install"

## Execution
Frontend
1. Run the command, "npm run dev"
   Open your browser and access http://localhost:5173

Backend
2. Run "mvn spring-boot:run"
   Open your browser and access http://localhost:2800

# Ideal UX
## 1. Dashboard (Home Page)
Purpose: Provide an overview of the application and quick navigation options.
Content to Display:
Summary of all students registered in the system (How many).
Notifications or alerts for exceptions, like missing grades or registrations.
Features:
A search bar to quickly find a student, module, or specific grade details.
Shortcut links to manage students, modules, and registrations.
## 2. Students Page
Purpose: Allow teachers to view, add, and manage student information.
Content to Display:
A list of students with basic details (ID, first name, last name, and email).
Button/link to view individual student details.
Features:
Add New Student: A form to input new student details.
Edit/View Student: Clicking on a student opens the Student Details page.
Delete Student: Option to remove a student, with confirmation to avoid accidental deletions. - might be better from the Student Detail Page
## 3. Student Details Page
Purpose: Display and manage specific details about an individual student.
Content to Display:
Detailed student information (username, email, and other attributes).
Grades Section: List of grades for each module the student is registered in. As well as the ones without Grades
Show module names, scores, and compute average grades.
Registered Modules Section: List of modules the student is registered in, with the ability to add or remove modules as well as add or change grade.
Features:
Compute Average: Show the computed average grade for the student.
Add Grade: A form to input a new grade for a specific module.
Add Module: Ability to register the student in a new module.
Exception Handling: If a grade or module isn’t available, show a clear message (possibly derived from NoGradeAvailableException and NoRegistrationException).
## 4. Modules Page
Purpose: Enable teachers to view and manage modules.
Content to Display:
A list of all modules with attributes such as code, name.
Features:
Add New Module: Form to create a new module with details.
## 5. Module Details Page
Purpose: View details for a specific module and manage associated grades.
Content to Display:
Module information (code, name, mnc).
List of students registered in the module with their grades.
Features:
Edit Module: Option to update module information.
Add Grade: Ability to add a grade for students in this module.
Remove Student: Option to unregister a student from the module if needed.
## 6. Registration Page
Step 1: Select Module
Dropdown to choose the module. Once a module is selected, display the students associated with it.
Step 2: Manage Students
Student Table: Show a list of students with checkboxes next to each name.
Bulk Select: Allows the teacher to select multiple students at once.
Register/Unregister Buttons: After selecting students, click to either register or unregister them for the chosen module.
Additional Features:
Filter/Search: Filter the student list by name or other criteria.
Clear Feedback: Success and error messages after each action, with an undo option
## 7. Exceptions/Notifications Page
Purpose: Display all exceptions or notifications related to missing grades or registrations.
Content to Display:
List of NoGradeAvailableException and NoRegistrationException instances.
Detailed message about each exception, which could include the student, module, and a timestamp.
Features:
Resolve Exception: Directly link to the relevant student or module page to quickly add missing grades or complete registrations.
Mark as Resolved: Allow teachers to clear or dismiss resolved exceptions from the list.
## 8. Insights Page
Purpose: Generate reports on student performance and module summaries.
Content to Display:
Summary of average grades per student and module.
Option to filter by student, module, or grade range.
Features:
Generate Report: Export data to PDF or Excel format.
Filter Options: View specific details, like students below a certain grade threshold or top-performing modules.
## UX Considerations:
Consistency: Maintain a consistent layout across pages, with navigation menus on the left and main content on the right.
Accessibility: Use clear headings, descriptive button labels, and ensure the design is keyboard- and screen-reader-friendly.
Error Handling: Clearly indicate when an exception occurs (e.g., missing grade), with a prompt to resolve it.
Feedback: Show confirmation messages for successful actions (e.g., "Grade added successfully") and provide undo options where applicable.

