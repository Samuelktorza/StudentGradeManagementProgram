import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import Home from "./Home";
import Modules from "./module/Modules";
import Students from "./student/Students";
import AddStudent from "./student/AddStudent";
import StudentDetail from "./student/StudentDetail";
import Grades from "./grade/Grades";
import AddGrade from "./grade/AddGrade";
import GradeDetail from "./grade/GradeDetail";
import Insights from "./insights/Insights.jsx";
import AddModule from "./module/AddModule.jsx"; // Import the new Insights component
import ModuleDetail from "./module/ModuleDetail"; // Import ModuleDetail component
import Registration from "./registration/Registration";
import AddRegistration from "./registration/AddRegistration";
import RegistrationDetail from "./registration/RegistrationDetail";
import BulkRegistration from "./registration/BulkRegistration.jsx";
import ErrorPage from "./ErrorPage"; // Import the ErrorPage component
import BulkModuleRegistration from "./registration/BulkModuleRegistration.jsx";

const router = createBrowserRouter([
    { path: "/", element: <Home /> },
    { path: "/students", element: <Students /> },
    { path: "/students/addStudent", element: <AddStudent /> },
    { path: "/students/:id", element: <StudentDetail /> },
    { path: "/modules", element: <Modules /> },
    { path: "/modules/addModule", element: <AddModule /> },
    { path: "/modules/:id", element: <ModuleDetail /> },
    { path: "/grades", element: <Grades /> },
    { path: "/grades/addGrade", element: <AddGrade /> },
    { path: "/grades/:id", element: <GradeDetail /> },
    { path: "/registration", element: <Registration /> },
    { path: "/registration/AddRegistration", element: <AddRegistration /> },
    { path: "/registration/:id", element: <RegistrationDetail /> },
    { path: "/Insights", element: <Insights /> },
    { path: "/registration/BulkRegistration", element: <BulkRegistration /> },
    { path: "*", element: <ErrorPage /> }, // Add this line for the error page
    { path: "/registration/BulkModuleRegistration", element: <BulkModuleRegistration />}
]);
//
createRoot(document.getElementById("root")).render(
    <StrictMode>
        <RouterProvider router={router} />
    </StrictMode>,
);