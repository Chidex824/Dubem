import axios from "axios";

const API = axios.create({ baseURL: "http://localhost:8000/api" });

export const fetchJobs = () => API.get("/jobs/");
export const fetchJobById = (id) => API.get(`/jobs/${id}/`);
export const fetchOpportunities = (params) => API.get("/opportunities/", { params });
export const fetchOpportunityById = (id) => API.get(`/opportunities/${id}/`);
export const createOpportunity = (data) => API.post("/opportunities/", data);
export const updateOpportunity = (id, data) => API.put(`/opportunities/${id}/`, data);
export const deleteOpportunity = (id) => API.delete(`/opportunities/${id}/`);
export const createUser = (data) => API.post("/users/", data);
export const verifyEmail = (token) => API.post("/users/verify-email/", { token });
export const loginUser = (data) => API.post("/users/login/", data);
export const fetchUserProfile = (token) => API.get("/users/profile/", { headers: { Authorization: `Bearer ${token}` } });   
export const updateUserProfile = (token, data) => API.put("/users/profile/", data, { headers: { Authorization: `Bearer ${token}` } });  
export const requestPasswordReset = (email) => API.post("/users/request-password-reset/", { email });
export const resetPassword = (token, newPassword) => API.post("/users/reset-password/", { token, new_password: newPassword });
export const fetchSavedJobs = (token) => API.get("/users/saved-jobs/", { headers: { Authorization: `Bearer ${token}` } });
export const saveJob = (token, jobId) => API.post(`/users/saved-jobs/${jobId}/`, {}, { headers: { Authorization: `Bearer ${token}` } });
export const unsaveJob = (token, jobId) => API.delete(`/users/saved-jobs/${jobId}/`, { headers: { Authorization: `Bearer ${token}` } });
export const fetchAlerts = (token) => API.get("/users/alerts/", { headers: { Authorization: `Bearer ${token}` } });
export const createAlert = (token, data) => API.post("/users/alerts/", data, { headers: { Authorization: `Bearer ${token}` } });    
export const deleteAlert = (token, alertId) => API.delete(`/users/alerts/${alertId}/`, { headers: { Authorization: `Bearer ${token}` } });


// Additional API functions can be added here as needed
export default API;
export const fetchRegions = () => API.get("/regions/");
export const fetchTypes = () => API.get("/types/");
export const fetchOrganizations = () => API.get("/organizations/");
export const fetchOrganizationById = (id) => API.get(`/organizations/${id}/`);
export const createOrganization = (data) => API.post("/organizations/", data);
export const updateOrganization = (id, data) => API.put(`/organizations/${id}/`, data);
export const deleteOrganization = (id) => API.delete(`/organizations/${id}/`);

export const fetchFellowships = () => API.get("/fellowships/");
export const fetchFellowshipById = (id) => API.get(`/fellowships/${id}/`);  
export const createFellowship = (data) => API.post("/fellowships/", data);
export const updateFellowship = (id, data) => API.put(`/fellowships/${id}/`, data);
export const deleteFellowship = (id) => API.delete(`/fellowships/${id}/`);

export const fetchInternships = () => API.get("/internships/");
export const fetchInternshipById = (id) => API.get(`/internships/${id}/`);
export const createInternship = (data) => API.post("/internships/", data);
export const updateInternship = (id, data) => API.put(`/internships/${id}/`, data);
export const deleteInternship = (id) => API.delete(`/internships/${id}/`);

export const fetchVolunteeringOpportunities = () => API.get("/volunteering/");
export const fetchVolunteeringOpportunityById = (id) => API.get(`/volunteering/${id}/`);
export const createVolunteeringOpportunity = (data) => API.post("/volunteering/", data);
export const updateVolunteeringOpportunity = (id, data) => API.put(`/volunteering/${id}/`, data);
export const deleteVolunteeringOpportunity = (id) => API.delete(`/volunteering/${id}/`);

export const fetchJobApplications = (token) => API.get("/users/job-applications/", { headers: { Authorization: `Bearer ${token}` } });
export const applyForJob = (token, jobId, applicationData) => API.post(`/users/job-applications/${jobId}/`, applicationData, { headers: { Authorization: `Bearer ${token}` } });
export const fetchJobApplicationById = (token, applicationId) => API.get(`/users/job-applications/${applicationId}/`, { headers: { Authorization: `Bearer ${token}` } });   
export const updateJobApplication = (token, applicationId, data) => API.put(`/users/job-applications/${applicationId}/`, data, { headers: { Authorization: `Bearer ${token}` } });
export const deleteJobApplication = (token, applicationId) => API.delete(`/users/job-applications/${applicationId}/`, { headers: { Authorization: `Bearer ${token}` } });
export const fetchJobApplicationStatus = (token, applicationId) => API.get(`/users/job-applications/${applicationId}/status/`, { headers: { Authorization: `Bearer ${token}` } });
export const updateJobApplicationStatus = (token, applicationId, status) => API.put(`/users/job-applications/${applicationId}/status/`, { status }, { headers: { Authorization: `Bearer ${token}` } });

export const fetchJobCategories = () => API.get("/job-categories/");
export const fetchJobCategoryById = (id) => API.get(`/job-categories/${id}/`);
export const createJobCategory = (data) => API.post("/job-categories/", data);
export const updateJobCategory = (id, data) => API.put(`/job-categories/${id}/`, data);
export const deleteJobCategory = (id) => API.delete(`/job-categories/${id}/`);

export const fetchJobTypes = () => API.get("/job-types/");
export const fetchJobTypeById = (id) => API.get(`/job-types/${id}/`);
export const createJobType = (data) => API.post("/job-types/", data);
export const updateJobType = (id, data) => API.put(`/job-types/${id}/`, data);
export const deleteJobType = (id) => API.delete(`/job-types/${id}/`);

export const fetchJobLocations = () => API.get("/job-locations/");
export const fetchJobLocationById = (id) => API.get(`/job-locations/${id}/`);
export const createJobLocation = (data) => API.post("/job-locations/", data);
export const updateJobLocation = (id, data) => API.put(`/job-locations/${id}/`, data);
export const deleteJobLocation = (id) => API.delete(`/job-locations/${id}/`);

export const fetchJobSalaries = () => API.get("/job-salaries/");
export const fetchJobSalaryById = (id) => API.get(`/job-salaries/${id}/`);
export const createJobSalary = (data) => API.post("/job-salaries/", data);  
export const updateJobSalary = (id, data) => API.put(`/job-salaries/${id}/`, data);
export const deleteJobSalary = (id) => API.delete(`/job-salaries/${id}/`);

export const fetchJobBenefits = () => API.get("/job-benefits/");
export const fetchJobBenefitById = (id) => API.get(`/job-benefits/${id}/`);
export const createJobBenefit = (data) => API.post("/job-benefits/", data);
export const updateJobBenefit = (id, data) => API.put(`/job-benefits/${id}/`, data);
export const deleteJobBenefit = (id) => API.delete(`/job-benefits/${id}/`);

export const fetchJobSkills = () => API.get("/job-skills/");
export const fetchJobSkillById = (id) => API.get(`/job-skills/${id}/`);
export const createJobSkill = (data) => API.post("/job-skills/", data);
export const updateJobSkill = (id, data) => API.put(`/job-skills/${id}/`, data);
export const deleteJobSkill = (id) => API.delete(`/job-skills/${id}/`);


export const fetchJobIndustries = () => API.get("/job-industries/");
export const fetchJobIndustryById = (id) => API.get(`/job-industries/${id}/`);
export const createJobIndustry = (data) => API.post("/job-industries/", data);  
export const updateJobIndustry = (id, data) => API.put(`/job-industries/${id}/`, data);
export const deleteJobIndustry = (id) => API.delete(`/job-industries/${id}/`);


export const fetchJobExperienceLevels = () => API.get("/job-experience-levels/");
export const fetchJobExperienceLevelById = (id) => API.get(`/job-experience-levels/${id}/`);
export const createJobExperienceLevel = (data) => API.post("/job-experience-levels/", data);
export const updateJobExperienceLevel = (id, data) => API.put(`/job-experience-levels/${id}/`, data);
export const deleteJobExperienceLevel = (id) => API.delete(`/job-experience-levels/${id}/`);


export const fetchJobEducationLevels = () => API.get("/job-education-levels/");
export const fetchJobEducationLevelById = (id) => API.get(`/job-education-levels/${id}/`);
export const createJobEducationLevel = (data) => API.post("/job-education-levels/", data);  
export const updateJobEducationLevel = (id, data) => API.put(`/job-education-levels/${id}/`, data);
export const deleteJobEducationLevel = (id) => API.delete(`/job-education-levels/${id}/`);


export const fetchJobLanguages = () => API.get("/job-languages/");
export const fetchJobLanguageById = (id) => API.get(`/job-languages/${id}/`);   
export const createJobLanguage = (data) => API.post("/job-languages/", data);
export const updateJobLanguage = (id, data) => API.put(`/job-languages/${id}/`, data);
export const deleteJobLanguage = (id) => API.delete(`/job-languages/${id}/`);


